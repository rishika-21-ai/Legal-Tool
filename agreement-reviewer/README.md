# Agreement Reviewer

A ready-to-use **Claude Project** that reviews your agreements and tells you, in
plain English, **what's missing, what's risky or one-sided, and how to fix it** —
with suggested wording for the gaps.

It runs on **claude.ai** using your existing Max plan. No coding, no setup cost,
no API key.

## What's in this folder

| File | What it's for |
|---|---|
| `project-instructions.md` | The text you paste into the Claude Project's instructions box. |
| `checklists/common-clauses.md` | Clauses that belong in almost any agreement. |
| `checklists/nda.md` | NDA / confidentiality specifics. |
| `checklists/service-saas.md` | Service / vendor / SaaS / MSA specifics. |
| `checklists/employment.md` | Employment / contractor specifics. |
| `checklists/lease-partnership-other.md` | Lease, partnership/JV, sale, and general. |
| `sample-review.md` | An example review, so you know what the output looks like. |

## Set it up once (about 5 minutes)

1. Go to **claude.ai** and sign in (your Max plan).
2. In the left sidebar, click **Projects → Create project**. Name it
   **"Agreement Reviewer."**
3. Open the project, find **Project instructions** (sometimes under
   "Set project instructions" or a pencil/edit icon), and **paste in the full
   contents of `project-instructions.md`**. Save.
4. Find **Project knowledge** (the "Add content" / files area) and **upload these
   files**:
   - all five files in the `checklists/` folder, and
   - optionally `sample-review.md`.

   *(To get a file's contents: open it here on GitHub, or ask me and I'll paste
   the text so you can save it as a `.md` or `.txt` file to upload. A plain text
   file works fine too.)*

That's it — the project is now your reviewer.

## Use it (every time)

1. Open the **Agreement Reviewer** project and start a **new chat**.
2. **Paste the agreement text**, or upload the file (PDF/Word), and say:
   *"Review this agreement. I'm the [customer / vendor / employer / employee /
   disclosing party / receiving party]."*
3. Claude replies with a structured report:
   1. Agreement type & your position
   2. Overall summary
   3. **Missing clauses** (with why they matter + suggested wording)
   4. **Present but risky / one-sided** (with severity + suggested fix)
   5. Present & OK
   6. Questions to clarify
   7. Reminder that this isn't legal advice
4. Ask follow-ups, e.g. *"Draft the missing indemnity clause,"* or
   *"Rewrite the liability clause to be fair to both sides."*

## Tips

- **Tell it which side you're on.** "Missing" is the same for everyone, but
  "risky / one-sided" depends on whether you're the customer or the vendor,
  employer or employee. If you don't say, Claude will ask.
- **Make it yours.** Over time you can edit the checklist files to add your
  company's standard positions (e.g. "we always require a 12-month liability
  cap"). Re-upload the edited file to the project and every future review uses it.
- **Big documents:** paste the whole thing or upload the file. If it's very long,
  Claude will still work through it; you can also review section by section.

## Important

This tool helps you **spot gaps quickly** — it is **not legal advice** and not a
replacement for a qualified lawyer. Use it as a first pass, then get professional
review for anything high-stakes.
