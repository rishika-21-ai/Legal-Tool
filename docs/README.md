# Agreement Review Checklist (free web page)

`index.html` in this folder is a **complete, self-contained web page** that helps
anyone review an agreement and spot missing or risky clauses — with plain-English
guidance and suggested wording. 

- **No AI, no accounts, no sign-in, no cost.**
- **No internet needed** — everything is inside the single file.
- Works for **unlimited people**; each person just opens the page.

It's the no-cost, whole-team companion to the AI-powered `agreement-reviewer/`
Claude Project (which needs a Claude account). The clause content mirrors
`agreement-reviewer/checklists/*.md` — if you edit clauses in one place, update the
other to match.

## How a colleague uses it

1. Open the page (see sharing options below).
2. Choose the **agreement type** and **which side you're on**.
3. Read the agreement next to the checklist. For each clause, click **Present**,
   **Needs attention**, or **Missing**. Click *"Why it matters / what to check"*
   for guidance, red flags, and suggested wording; add optional notes.
4. The **Summary** at the bottom lists everything missing or needing attention,
   with suggested wording.
5. Click **Copy summary** (to paste into an email/doc) or **Print / Save as PDF**.

Progress and notes are saved in that person's own browser, so a refresh won't lose
their work. **Start a new review** clears it.

## Three free ways to share it with your organisation

**Option 1 — Email or shared drive (simplest, zero setup)**
Send `index.html` as an attachment, or drop it in a shared Google Drive / OneDrive
/ intranet folder. Colleagues **double-click to open** it in their browser. Done.

**Option 2 — Publish a link with GitHub Pages (free)**
Gives everyone one clean URL.
1. On GitHub, open the **Legal-Tool** repository → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Pick the branch, set the folder to **`/docs`**, and click **Save**.
4. Wait ~1 minute; GitHub shows the public URL (like
   `https://<org>.github.io/Legal-Tool/`). Share that link.

**Option 3 — Any web host / intranet**
Because it's a single static file, you can drop `index.html` onto any web server,
SharePoint, or internal wiki that serves HTML.

## Editing the checklist

Open `index.html` in a text editor and find the `const C = {` block near the
bottom. Each clause is `{ c: name, why: ..., look: ..., flags: ..., sug: ... }`.
Add, remove, or edit entries (e.g. add your company's standard positions), save,
and re-share the file. No build step or tools required.

## Note

This checklist is a first-pass aid to help spot gaps — it is **not legal advice**.
For anything high-stakes, have a qualified lawyer confirm.
