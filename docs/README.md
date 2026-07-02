# Agreement tools (free web pages)

Two free, browser-only tools for reviewing agreements. **No sign-in, no accounts,
no server, no cost**, and — importantly — **your document never leaves your
computer**. They run entirely in the browser.

| File | What it does |
| --- | --- |
| **`index.html`** | **Auto-Checker** — upload an agreement (Word/PDF/text) and it instantly scans it and shows which standard clauses are **missing**, with suggested wording. |
| `checklist.html` | Manual checklist — tick each clause yourself (no upload). Linked from the Auto-Checker. |
| `vendor/` | Bundled libraries used to read Word/PDF files in the browser (mammoth, pdf.js). No internet needed at runtime. |

## Auto-Checker — how it works

1. Open `index.html`. Drag in a file (`.docx`, `.pdf`, `.txt`) or paste the text.
2. It reads the document **in your browser**, guesses the agreement type (you can
   change it), and scans for each standard clause.
3. Each clause is marked **auto: found** or **auto: not found**, with the matching
   snippet shown so you can verify. Use the **✓ Present / ! Check / ✗ Missing**
   buttons to correct anything.
4. The **Summary** lists likely-missing clauses with suggested wording. **Copy** it
   or **Print / Save as PDF**.

### Honest limitation (shown in the tool)

The Auto-Checker finds clauses by **matching keywords**, not by truly understanding
the text. So it's a helpful **first-pass**:

- ✅ Good at: "Is there a liability cap / termination / confidentiality /
  governing-law clause at all?" and giving suggested wording for gaps.
- ⚠️ Not good at: judging whether a clause is *fair or one-sided*, or catching one
  that's worded unusually — it can miss or mis-flag. Always double-check, and use
  the buttons to correct results.

It is **not legal advice**. For true AI understanding (missing + risky + tailored
suggestions), that requires either a paid API key or each person's own Claude
account — see the repo's `agreement-reviewer/` (Claude Project) for that path.

### Privacy

Everything runs client-side. The uploaded file is parsed in the browser and is
**never uploaded anywhere** and **no AI service is called** — safe for confidential
contracts.

## Sharing it with your organisation (all free)

1. **Email / shared drive:** send the whole `docs/` folder (it needs `index.html`,
   `checklist.html`, and the `vendor/` folder together). Colleagues open
   `index.html`.
2. **GitHub Pages (public link):** repo → **Settings → Pages → Deploy from a
   branch → Branch `main`, Folder `/docs`**. Share the resulting
   `https://<org>.github.io/Legal-Tool/` URL. (Free Pages needs a public repo.)
3. **Any intranet / web host:** upload the `docs/` folder.

> Note: because it reads Word/PDF files, the Auto-Checker needs the `vendor/`
> files alongside it — keep the folder together. (The manual `checklist.html` is a
> single file and works entirely on its own.)

## Editing the clauses / keywords

Open `index.html`, find `const C = {`. Each clause is
`{ c, keys:[/regex/i, …], why, look, flags, sug }`. Edit the text or the `keys`
detection patterns, save, re-share. No build step.
