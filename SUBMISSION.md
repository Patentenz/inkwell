# Submission: Inkwell

**Candidate:** Noli A. Carriaga (nolicarriaga@gmail.com)
**Role:** AI-Native Full Stack Product Engineer, Ajaia LLC

## Links

- **Live app:** https://inkwell-five-gamma.vercel.app/

## Demo users (no password needed)

Switch users from the menu in the top-right corner.

- **Alice:** owns "Welcome to Inkwell"
- **Bob:** editor on "Welcome to Inkwell"
- **Charlie:** no documents yet, useful for testing sharing from scratch

## What's in this folder

| File | Contents |
|---|---|
| `inkwell-source.zip` | Full source code |
| `README.md` | Setup, run instructions, features, scope cuts, limitations |
| `ARCHITECTURE.md` | What I prioritized and why |
| `AI-WORKFLOW.md` | AI tools used, what I changed or rejected, how I verified |
| `SUBMISSION.md` | This file |
| `VIDEO_URL.txt` | Walkthrough video link |

## What works end to end

- Create, rename, edit, delete and reopen documents
- Bold, italic, underline, Heading 1/2, bulleted and numbered lists
- Autosave with a visible save status
- Import `.md` / `.txt` files (max 1 MB) as new documents
- Share with Viewer or Editor access, change role, revoke access
- Owned vs. shared documents shown in the sidebar and document header
- Permissions enforced on the server
- Data persists in Supabase Postgres
- 30 unit tests (access rules, sharing rules, validation, import)

Stretch item completed: role-based sharing (Viewer / Editor).

## What's incomplete or cut

Real auth, real-time collaboration, version history, comments, export, image upload and `.docx` import were deliberately cut. Reasoning is in the README.
