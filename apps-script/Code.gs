/**
 * Legal-Tool — Claude for Google Sheets
 * =====================================
 * A Google Apps Script integration that connects the Claude API (Anthropic)
 * to Google Sheets, so cells and menu actions can call Claude directly.
 *
 * Google Apps Script has no npm and no official Anthropic SDK, so this talks to
 * the Messages API over raw HTTPS via UrlFetchApp — the cURL-equivalent path.
 *
 * Two ways to use it:
 *   1. The =CLAUDE(prompt, [context]) custom function inside any cell.
 *   2. The "Claude" menu (added on open) to process a selected range or set up
 *      the API key.
 *
 * The API key is read from Script Properties — never hard-coded. Set it once via
 * the Claude ▸ "Set API key…" menu item.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Anthropic Messages API endpoint. */
var CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/** API version header value required by the Messages API. */
var ANTHROPIC_VERSION = '2023-06-01';

/**
 * Default model. Opus 4.8 is the most capable current model; override per-call
 * with the optional model argument or by changing the "CLAUDE_MODEL" script
 * property. See https://docs.claude.com for the current model list.
 */
var DEFAULT_MODEL = 'claude-opus-4-8';

/** Default output cap for a single cell answer — kept small for concise cells. */
var DEFAULT_MAX_TOKENS = 1024;

/** Script Property keys. */
var PROP_API_KEY = 'ANTHROPIC_API_KEY';
var PROP_MODEL = 'CLAUDE_MODEL';

// ---------------------------------------------------------------------------
// Menu / UI
// ---------------------------------------------------------------------------

/**
 * Adds the "Claude" menu when the spreadsheet opens.
 * @param {Object} e The onOpen event (unused).
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('Claude')
    .addItem('Ask Claude about selected cells…', 'promptOnSelection')
    .addItem('Summarize selected cells → next column', 'summarizeSelection')
    .addSeparator()
    .addItem('Set API key…', 'setApiKey')
    .addItem('Set model…', 'setModel')
    .addItem('Test connection', 'testConnection')
    .addToUi();
}

/**
 * Stores the Anthropic API key in Script Properties.
 * Prompted so the key never has to live in the sheet or in source.
 */
function setApiKey() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
    'Set Anthropic API key',
    'Paste your API key (starts with "sk-ant-"). It is stored in Script ' +
      'Properties for this project only, not in the spreadsheet.',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  var key = (response.getResponseText() || '').trim();
  if (!key) {
    ui.alert('No key entered. Nothing was saved.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty(PROP_API_KEY, key);
  ui.alert('API key saved. Try "Claude ▸ Test connection".');
}

/**
 * Lets the user override the default model per spreadsheet.
 */
function setModel() {
  var ui = SpreadsheetApp.getUi();
  var current = getModel();
  var response = ui.prompt(
    'Set Claude model',
    'Current model: ' + current + '\n\nEnter a model id (e.g. ' +
      DEFAULT_MODEL + '). Leave blank to reset to the default.',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  var model = (response.getResponseText() || '').trim();
  var props = PropertiesService.getScriptProperties();
  if (model) {
    props.setProperty(PROP_MODEL, model);
    ui.alert('Model set to ' + model + '.');
  } else {
    props.deleteProperty(PROP_MODEL);
    ui.alert('Model reset to default (' + DEFAULT_MODEL + ').');
  }
}

/**
 * Sends a tiny request to verify the API key and connectivity.
 */
function testConnection() {
  var ui = SpreadsheetApp.getUi();
  try {
    var reply = callClaude('Reply with exactly the word: ok', '', {
      maxTokens: 16
    });
    ui.alert('Connection OK. Claude replied: ' + reply);
  } catch (err) {
    ui.alert('Connection failed: ' + err.message);
  }
}

/**
 * Asks the user for an instruction, applies it to the selected range's text,
 * and shows the result in a dialog.
 */
function promptOnSelection() {
  var ui = SpreadsheetApp.getUi();
  var range = SpreadsheetApp.getActiveRange();
  if (!range) {
    ui.alert('Select one or more cells first.');
    return;
  }
  var response = ui.prompt(
    'Ask Claude',
    'What should Claude do with the selected cells?\n' +
      '(e.g. "Summarize the key obligations", "Extract every party name")',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  var instruction = (response.getResponseText() || '').trim();
  if (!instruction) {
    return;
  }
  var context = rangeToText(range);
  try {
    var reply = callClaude(instruction, context, { maxTokens: 4096 });
    ui.alert('Claude', reply, ui.ButtonSet.OK);
  } catch (err) {
    ui.alert('Error: ' + err.message);
  }
}

/**
 * For each non-empty cell in the selection, writes a one-line Claude summary
 * into the cell immediately to its right.
 */
function summarizeSelection() {
  var ui = SpreadsheetApp.getUi();
  var range = SpreadsheetApp.getActiveRange();
  if (!range) {
    ui.alert('Select the cells to summarize first.');
    return;
  }
  var sheet = range.getSheet();
  var values = range.getValues();
  var startRow = range.getRow();
  var outCol = range.getColumn() + range.getNumColumns();

  for (var r = 0; r < values.length; r++) {
    for (var c = 0; c < values[r].length; c++) {
      var cell = values[r][c];
      if (cell === '' || cell === null) {
        continue;
      }
      try {
        var summary = callClaude(
          'Summarize the following in one concise sentence. ' +
            'Reply with the sentence only, no preamble.',
          String(cell),
          { maxTokens: 256 }
        );
        sheet.getRange(startRow + r, outCol + c).setValue(summary);
      } catch (err) {
        sheet.getRange(startRow + r, outCol + c).setValue('ERROR: ' + err.message);
      }
    }
  }
  SpreadsheetApp.getActiveSpreadsheet().toast('Done summarizing selection.');
}

// ---------------------------------------------------------------------------
// Custom function
// ---------------------------------------------------------------------------

/**
 * Ask Claude from a cell.
 *
 * Usage:
 *   =CLAUDE("Classify sentiment as positive/negative/neutral", A2)
 *   =CLAUDE("Extract the effective date", A2)
 *   =CLAUDE(B1)                         // B1 holds the full prompt
 *
 * @param {string} prompt      The instruction for Claude.
 * @param {string=} context    Optional cell/text to act on (appended to the prompt).
 * @param {string=} model      Optional model id override.
 * @return {string} Claude's text reply.
 * @customfunction
 */
function CLAUDE(prompt, context, model) {
  if (prompt === undefined || prompt === null || String(prompt).trim() === '') {
    throw new Error('CLAUDE: the first argument (prompt) is required.');
  }
  // Custom functions may receive ranges as 2-D arrays; flatten to text.
  var promptText = valueToText(prompt);
  var contextText = context === undefined ? '' : valueToText(context);
  var opts = {};
  if (model) {
    opts.model = String(model).trim();
  }
  return callClaude(promptText, contextText, opts);
}

// ---------------------------------------------------------------------------
// Core API call
// ---------------------------------------------------------------------------

/**
 * Calls the Claude Messages API and returns the concatenated text response.
 *
 * @param {string} instruction  The user instruction / question.
 * @param {string} context      Optional supporting text; appended if non-empty.
 * @param {Object=} opts        { model, maxTokens, system }.
 * @return {string} The text of Claude's reply.
 */
function callClaude(instruction, context, opts) {
  opts = opts || {};
  var apiKey = getApiKey();

  var userContent = context
    ? instruction + '\n\n---\n' + context
    : instruction;

  var payload = {
    model: opts.model || getModel(),
    max_tokens: opts.maxTokens || DEFAULT_MAX_TOKENS,
    messages: [{ role: 'user', content: userContent }]
  };
  if (opts.system) {
    payload.system = opts.system;
  }

  var response = UrlFetchApp.fetch(CLAUDE_API_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  var body = response.getContentText();
  var data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    throw new Error('Unexpected response (HTTP ' + code + '): ' + body);
  }

  if (code !== 200) {
    var message = data && data.error && data.error.message
      ? data.error.message
      : body;
    throw new Error('API error (HTTP ' + code + '): ' + message);
  }

  // A safety refusal returns HTTP 200 with stop_reason "refusal" and no usable
  // content — surface it rather than returning an empty string.
  if (data.stop_reason === 'refusal') {
    throw new Error('Request was declined by safety filters (refusal).');
  }

  return extractText(data);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Concatenates all text blocks from a Messages API response. */
function extractText(data) {
  if (!data || !data.content || !data.content.length) {
    return '';
  }
  var parts = [];
  for (var i = 0; i < data.content.length; i++) {
    if (data.content[i].type === 'text') {
      parts.push(data.content[i].text);
    }
  }
  return parts.join('').trim();
}

/** Reads the API key from Script Properties or throws a helpful error. */
function getApiKey() {
  var key = PropertiesService.getScriptProperties().getProperty(PROP_API_KEY);
  if (!key) {
    throw new Error(
      'No API key set. Use the "Claude ▸ Set API key…" menu (or set the ' +
        PROP_API_KEY + ' script property).'
    );
  }
  return key;
}

/** Returns the configured model, falling back to the default. */
function getModel() {
  return (
    PropertiesService.getScriptProperties().getProperty(PROP_MODEL) ||
    DEFAULT_MODEL
  );
}

/** Joins all values in a range into a tab/newline-delimited string. */
function rangeToText(range) {
  return valueToText(range.getValues());
}

/**
 * Normalizes a custom-function argument (string, number, or 2-D array from a
 * range) into a single string.
 */
function valueToText(value) {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value
      .map(function (row) {
        return Array.isArray(row)
          ? row
              .map(function (cell) {
                return cell === null || cell === undefined ? '' : String(cell);
              })
              .join('\t')
          : String(row);
      })
      .join('\n')
      .trim();
  }
  return String(value).trim();
}
