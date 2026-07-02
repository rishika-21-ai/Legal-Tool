# Claude for Google Sheets (Google Apps Script)

This is a [Google Apps Script](https://developers.google.com/apps-script) project
that connects the **Claude API (Anthropic)** to **Google Sheets**. It adds a
`=CLAUDE()` custom function and a **Claude** menu so you can classify, extract,
summarize, and draft directly from a spreadsheet — a natural fit for reviewing
legal text at scale.

Because Apps Script has no npm and no official Anthropic SDK, it calls the
[Messages API](https://docs.claude.com) over raw HTTPS with `UrlFetchApp`
(the cURL-equivalent path), using API-key auth and the `claude-opus-4-8` model.

## Files

| File               | Purpose                                                        |
| ------------------ | ------------------------------------------------------------- |
| `Code.gs`          | Menu, `=CLAUDE()` custom function, and the API-call helper.    |
| `appsscript.json`  | Manifest (V8 runtime + the OAuth scopes the script needs).    |

## Setup

### Option A — Paste into the Apps Script editor (fastest)

1. Open your Google Sheet → **Extensions ▸ Apps Script**.
2. Replace the default `Code.gs` with this repo's `Code.gs`.
3. Show the manifest (**Project Settings ▸ "Show appsscript.json"**) and paste
   in this repo's `appsscript.json`.
4. **Save**, then reload the spreadsheet. A **Claude** menu appears.
5. **Claude ▸ Set API key…** and paste your key (`sk-ant-…`). It is stored in
   this project's Script Properties — never in the sheet or in source.
6. **Claude ▸ Test connection** to confirm.

### Option B — Deploy with `clasp` (version-controlled)

```bash
npm install -g @google/clasp
clasp login
# In this directory:
clasp create --type sheets --title "Legal-Tool — Claude for Sheets" --rootDir .
clasp push
```

`clasp create` writes a `.clasp.json` with your new script ID. That file is
git-ignored (see `../.gitignore`) because the script ID is environment-specific.

## Usage

**Custom function** (recalculates like any formula):

```
=CLAUDE("Classify the risk as Low/Medium/High", A2)
=CLAUDE("Extract the governing-law jurisdiction", A2)
=CLAUDE("Rewrite this clause in plain English", A2)
=CLAUDE(B1)                         // B1 holds the full prompt
=CLAUDE("Summarize", A2, "claude-haiku-4-5")   // optional model override
```

**Menu actions:**

- **Ask Claude about selected cells…** — one instruction applied to the whole
  selection; result shown in a dialog.
- **Summarize selected cells → next column** — writes a one-line summary of each
  cell into the column to its right.
- **Set model…** — override the model per spreadsheet.

## Notes & limits

- **API key** lives in Script Properties (`ANTHROPIC_API_KEY`). To rotate it,
  re-run **Set API key…**.
- **Custom-function limits:** Sheets caps custom functions at ~30s each and
  caches results by input, so identical formulas won't re-bill. For large batches
  prefer the menu actions, which run without the recalculation limits.
- **Cost:** every call hits the paid Messages API. `max_tokens` defaults to 1024
  for the custom function and is kept small for the summarize action.
- **Refusals:** a safety refusal (HTTP 200, `stop_reason: "refusal"`) is surfaced
  as an error rather than an empty cell.
- **Model:** defaults to `claude-opus-4-8`. Change it in `DEFAULT_MODEL` or via
  **Set model…**.
