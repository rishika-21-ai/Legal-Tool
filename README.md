# Legal-Tool

Claude-powered tooling for legal document work.

## Google Apps Script — Claude for Google Sheets

An [Apps Script](apps-script/) integration that brings the Claude API into Google
Sheets: a `=CLAUDE()` custom function plus a **Claude** menu for classifying,
extracting, summarizing, and drafting over legal text — directly in a spreadsheet.

See **[`apps-script/README.md`](apps-script/README.md)** for setup and usage.

## Agreement Reviewer (no-code, runs on claude.ai)

A ready-to-use [Claude Project](agreement-reviewer/) that reviews an agreement and
reports **what's missing, what's risky or one-sided, and how to fix it** — with
suggested wording. It runs in the browser on a Claude Max plan; no API key or code
required. Includes clause checklists for NDAs, service/SaaS, employment, and
lease/partnership agreements.

See **[`agreement-reviewer/README.md`](agreement-reviewer/README.md)** to set it up.

## Agreement Auto-Checker (free web page — upload & find missing clauses)

An [upload-based web tool](docs/index.html) for everyone in the organisation — **no
Claude, no sign-in, no cost**. Upload an agreement (**Word / PDF / text**) and it
instantly scans it and shows which standard clauses are **missing**, with suggested
wording, plus an editable results list. It runs **entirely in the browser** — the
document is never uploaded anywhere and no AI service is called (safe for
confidential contracts). It detects clauses by keywords, so it's an honest
first-pass, not a lawyer-level read; a manual [checklist](docs/checklist.html) is
also included. Share by sending the `docs/` folder or publishing a free GitHub
Pages link.

See **[`docs/README.md`](docs/README.md)** for usage, limitations, and sharing.
