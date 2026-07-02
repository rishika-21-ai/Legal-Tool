# Agreement AI Reviewer — free web app (Apps Script + Gemini)

A shareable web app: anyone opens a link, uploads an agreement (Word/PDF/text),
and gets an **AI review** — what's **missing**, what's **risky/one-sided**, and
**suggested wording**. **Free, no logins for users, works for everyone.**

- **Real AI understanding** (not keyword matching), so the suggestions fit the
  actual document.
- Powered by **Google's free Gemini API tier** — because Claude has no free API
  tier and you asked for $0. The API key stays **server-side** (in the Apps Script
  project); visitors never see it and don't need their own.

### Honest trade-offs of the free route

- 🔓 **Privacy:** the uploaded text is sent to Google's Gemini service to be
  reviewed. It's not as private as an in-browser tool — don't upload anything you
  aren't allowed to share with a third-party AI.
- ⏳ **Rate limits:** the free tier caps requests per minute/day. Fine for a small
  team; heavy simultaneous use can be throttled (users get a "try again" message).
- ⚠️ **Not legal advice.** AI can be wrong — treat it as a first pass.

## Files

| File | Purpose |
| --- | --- |
| `Code.gs` | Server code: serves the page and calls Gemini (key hidden in Script Properties). |
| `Index.html` | The upload page + results UI (file reading happens in the visitor's browser). |
| `appsscript.json` | Manifest — V8, external-request scope, web app deployed to "Anyone". |

## One-time setup (about 10 minutes, done by one person)

You need any Google account to host it. Users of the finished link do **not**.

**1. Get a free Gemini API key**
- Go to **https://aistudio.google.com/apikey** → **Create API key**. The free tier
  needs no billing. Copy the key.

**2. Create the Apps Script project**
- Go to **https://script.google.com** → **New project**.
- Replace the default `Code.gs` with this repo's `Code.gs`.
- Click **+ → HTML**, name it exactly **`Index`**, and paste this repo's
  `Index.html` into it.
- **Project Settings** (gear icon) → tick **"Show appsscript.json"**, then open the
  manifest and paste this repo's `appsscript.json`.

**3. Add your key (kept private)**
- **Project Settings → Script Properties → Add script property**:
  - Property: `GEMINI_API_KEY`  ·  Value: *(paste your key)* → **Save**.

**4. Deploy as a web app**
- **Deploy → New deployment → ⚙ → Web app**.
- **Execute as: Me** · **Who has access: Anyone** → **Deploy**.
- Authorize when prompted (it's your own script). Copy the **Web app URL**.

**5. Share the URL** with your colleagues. They open it, upload an agreement, and
get the review. No accounts, no cost to them.

> Prefer the command line? You can push these files with
> [`clasp`](https://github.com/google/clasp) (`clasp create --type webapp`,
> `clasp push`, `clasp deploy`), then set the Script Property and deployment access
> in the editor.

## Updating / maintenance

- **Change the AI model:** edit `GEMINI_MODEL` at the top of `Code.gs` (see
  https://ai.google.dev/gemini-api/docs/models for current free models).
- **Rotate the key:** update the `GEMINI_API_KEY` script property.
- **Edit what it checks:** the `CHECKLISTS` map in `Code.gs` lists the clauses the
  AI is told to look for per agreement type.

## How it compares to the other tools here

| Tool | AI? | Cost | Logins | Privacy |
| --- | --- | --- | --- | --- |
| **This app** (`ai-web-app/`) | ✅ real AI | free tier | none for users | text sent to Google AI |
| `docs/index.html` (auto-checker) | ❌ keywords | free | none | 100% in-browser |
| `agreement-reviewer/` (Claude Project) | ✅ Claude | Claude plan | per person | per Claude's terms |
