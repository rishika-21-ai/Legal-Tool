/**
 * Agreement AI Reviewer — free web app (Google Apps Script + Google Gemini)
 * =========================================================================
 * A shareable web app where anyone (no login, no Claude) uploads an agreement
 * and gets an AI review: what's missing, what's risky, and suggested wording.
 *
 * Why Gemini and not Claude? The user needs it FREE for everyone. Anthropic has
 * no free API tier, so this uses Google's FREE Gemini API tier. The API key is
 * stored server-side in Script Properties and never exposed to visitors.
 *
 * Deploy: see README.md. In short — add a GEMINI_API_KEY script property
 * (free key from https://aistudio.google.com/apikey), then Deploy ▸ New
 * deployment ▸ Web app ▸ Execute as "Me", Access "Anyone".
 *
 * Limits / notes:
 *  - Uploaded text is sent to Google's Gemini API (not fully private).
 *  - Free tier has rate limits; heavy simultaneous use may be throttled.
 *  - AI can make mistakes — this is a first-pass aid, not legal advice.
 */

// Free-tier model. If this name ever changes, update it here (see
// https://ai.google.dev/gemini-api/docs/models for current free models).
var GEMINI_MODEL = 'gemini-2.0-flash';
var PROP_KEY = 'GEMINI_API_KEY';

/** Clause checklists per agreement type — tells the AI what to look for. */
var CHECKLISTS = {
  common: [
    'Parties & signatures', 'Term (duration)', 'Termination (for cause + convenience)',
    'Governing law & jurisdiction', 'Dispute resolution', 'Limitation of liability',
    'Indemnification', 'Confidentiality', 'Intellectual property ownership',
    'Warranties & disclaimers', 'Assignment', 'Notices', 'Entire agreement',
    'Severability', 'Force majeure', 'Amendment', 'Data protection / privacy'
  ],
  nda: [
    'Mutual vs one-way', 'Definition of Confidential Information', 'Standard exclusions',
    'Permitted use / purpose', 'Permitted disclosures (need-to-know & legal)',
    'Term of confidentiality', 'Return or destruction', 'No licence / no obligation',
    'Remedies / injunctive relief'
  ],
  serviceSaas: [
    'Scope of services / SOW', 'Fees, payment terms & taxes', 'Service levels (SLA) / uptime',
    'Data ownership & return', 'Data security', 'Subprocessors', 'Support & maintenance',
    'Term, renewal & auto-renewal', 'Warranties & acceptance', 'Insurance', 'Exit / transition assistance'
  ],
  employment: [
    'Role, duties & reporting', 'Employee vs contractor classification', 'Compensation & benefits',
    'Working hours, location & expenses', 'At-will status / notice period', 'Termination & severance',
    'IP assignment', 'Confidentiality', 'Non-compete (enforceability varies)', 'Non-solicitation'
  ],
  lease: [
    'Rent, deposit & increases', 'Term, renewal & early exit', 'Maintenance & repairs',
    'Use, alterations & subletting', 'Insurance & liability'
  ],
  partnership: [
    'Capital contributions & ownership %', 'Profit/loss sharing & distributions',
    'Governance & decision-making', 'Exit, buyout & dissolution', 'IP & non-compete between partners'
  ],
  sale: [
    'Description, quantity & price', 'Delivery, title & risk of loss',
    'Inspection, acceptance & returns', 'Warranties & remedies for defects'
  ],
  general: []
};

var TYPE_LABELS = {
  nda: 'NDA / Confidentiality', serviceSaas: 'Service / Vendor / SaaS',
  employment: 'Employment / Contractor', lease: 'Lease / Rental',
  partnership: 'Partnership / Joint Venture', sale: 'Sale / Purchase',
  general: 'Other / General'
};

/** Serves the web page. */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Agreement AI Reviewer')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Called from the page. Sends the document text to Gemini and returns a review.
 * @param {string} text  The agreement text (extracted in the browser).
 * @param {string} type  One of the CHECKLISTS keys, or "auto".
 * @param {string} side  Which side the user is on (optional).
 * @return {Object} { detectedType, summary, missing[], risky[], present[] }
 */
function reviewDocument(text, type, side) {
  var apiKey = PropertiesService.getScriptProperties().getProperty(PROP_KEY);
  if (!apiKey) {
    throw new Error('This tool is not set up yet: the administrator needs to add a GEMINI_API_KEY. See README.');
  }
  text = String(text || '').trim();
  if (text.length < 40) {
    throw new Error('Please provide the agreement text (the file may be empty or a scanned image).');
  }
  // Guard against oversized requests (keep well within free-tier limits).
  if (text.length > 120000) {
    text = text.slice(0, 120000);
  }

  var checklistText = buildChecklistText(type);
  var system =
    'You are an experienced commercial contracts reviewer. Review the agreement and, in plain English, ' +
    'identify what standard clauses are MISSING and what present clauses are RISKY or one-sided, with practical ' +
    'suggested wording. Consider which side the user is on when judging "risky". Ground your review in the ' +
    'provided clause checklist but also use general contract knowledge. Be specific and practical. ' +
    'You are a first-pass aid, not a substitute for a lawyer.\n\n' + checklistText;

  var user =
    'The user is reviewing this agreement' + (side ? ' as the ' + side : '') + '.\n' +
    'Return ONLY JSON matching this shape:\n' +
    '{"detectedType": string, "summary": string, ' +
    '"missing": [{"clause": string, "why": string, "suggestion": string}], ' +
    '"risky": [{"clause": string, "issue": string, "severity": "High"|"Medium"|"Low", "fix": string}], ' +
    '"present": [string]}\n\n' +
    'AGREEMENT TEXT:\n"""\n' + text + '\n"""';

  var payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
  };

  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(GEMINI_MODEL) + ':generateContent?key=' + encodeURIComponent(apiKey);

  var resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = resp.getResponseCode();
  var body = resp.getContentText();
  if (code !== 200) {
    var msg = body;
    try { msg = JSON.parse(body).error.message; } catch (e) {}
    if (code === 429) throw new Error('The free AI limit was hit — please wait a minute and try again.');
    throw new Error('AI service error (' + code + '): ' + msg);
  }

  var data = JSON.parse(body);
  if (data.promptFeedback && data.promptFeedback.blockReason) {
    throw new Error('The request was blocked by the AI safety filter (' + data.promptFeedback.blockReason + ').');
  }
  var out = '';
  try { out = data.candidates[0].content.parts[0].text; } catch (e) {
    throw new Error('The AI returned an unexpected response. Please try again.');
  }
  var parsed;
  try { parsed = JSON.parse(out); } catch (e) {
    // Occasionally the model wraps JSON in prose/code fences — recover the JSON.
    var m = out.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('Could not read the AI response.');
    parsed = JSON.parse(m[0]);
  }
  parsed.missing = parsed.missing || [];
  parsed.risky = parsed.risky || [];
  parsed.present = parsed.present || [];
  return parsed;
}

/** Builds the checklist text handed to the model. */
function buildChecklistText(type) {
  var lines = ['Standard clauses to check for (common to most agreements):'];
  CHECKLISTS.common.forEach(function (c) { lines.push('- ' + c); });
  if (type && type !== 'auto' && CHECKLISTS[type] && CHECKLISTS[type].length) {
    lines.push('', 'Additional clauses specific to a ' + (TYPE_LABELS[type] || type) + ' agreement:');
    CHECKLISTS[type].forEach(function (c) { lines.push('- ' + c); });
  } else {
    lines.push('', 'Also apply the clauses specific to whatever agreement type you detect (NDA, service/SaaS, employment, lease, partnership, or sale).');
  }
  return lines.join('\n');
}

/** One-time helper: run once from the editor to store the key, then remove the argument. */
function setGeminiKey_(key) {
  PropertiesService.getScriptProperties().setProperty(PROP_KEY, key);
}
