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

## Agreement Review Checklist (free web page — no AI, no accounts)

A single self-contained [web page](docs/index.html) that walks anyone through a
clause-by-clause agreement review — pick the agreement type, mark each clause as
Present / Needs attention / Missing, read the guidance and suggested wording, then
Copy or Print a summary. **No AI, no sign-in, no cost, unlimited users** — ideal for
sharing across an organisation whose people don't have Claude. Share it by emailing
the file, hosting it on your intranet, or publishing a free link via GitHub Pages.

See **[`docs/README.md`](docs/README.md)** for usage and the sharing options.
