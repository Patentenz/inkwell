# Inkwell

A lightweight document editor inspired by Google Docs. Create and format documents, import Markdown or text files, and share documents with other users as viewers or editors.

**Live demo:** https://inkwell-five-gamma.vercel.app/

## Demo users

There is no login. Use the user menu in the top-right corner to switch between three seeded users:

| User | Email | Starts with |
|---|---|---|
| Alice | alice@inkwell.test | Owns "Welcome to Inkwell" |
| Bob | bob@inkwell.test | Has editor access to "Welcome to Inkwell" |
| Charlie | charlie@inkwell.test | No documents |

A quick way to test sharing: as Alice, open a document, click **Share**, add Charlie as a Viewer, then switch to Charlie.

## Features

- **Documents:** create, rename (inline title), edit, delete. Documents reopen exactly as saved.
- **Rich text:** bold, italic, underline, Heading 1, Heading 2, bulleted and numbered lists, undo/redo, keyboard shortcuts.
- **Autosave:** saves 1.5s after you stop typing, with a visible status (Saved / Saving… / Unsaved changes / Couldn't save + Retry). Ctrl/Cmd+S saves immediately.
- **File import:** upload a `.md`, `.markdown` or `.txt` file (max 1 MB) to create a new editable document. Headings, lists, bold and italic are preserved. A sample file is linked in the sidebar.
- **Sharing:** owners can share with another user as **Viewer** or **Editor**, change the role, or remove access. The sidebar separates "My documents" from "Shared with me", and the document header shows who owns the document and your access level.
- **Permissions enforced on the server:** viewers cannot save content or rename, only owners can share or delete, and users without access get a 404.

## Tech stack

- SvelteKit (Svelte 5, TypeScript strict)
- TipTap v3 editor
- Supabase Postgres (accessed only from the server)
- Vercel hosting
- Vitest for unit tests

## Run locally

Requirements: Node.js 20 or newer, a free Supabase project.

1. Install dependencies:
   ```bash
   npm install
   ```
2. In the Supabase SQL Editor, run these files in order:
   - `supabase/migrations/20261024000000_init.sql` (tables, indexes, trigger, RLS)
   - `supabase/migrations/20261024000100_grants.sql` (server role grants)
   - `supabase/seed.sql` (3 demo users and the sample document)
3. Copy `.env.example` to `.env` and fill in the values from Supabase → Project Settings → API Keys:
   ```
   SUPABASE_URL=https://<project>.supabase.co
   SUPABASE_SECRET_KEY=<secret key>
   ```
   Use the **secret** key, not the publishable key. It never reaches the browser.
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Other commands:
   ```bash
   npm test        # unit tests
   npm run check   # type check
   npm run build   # production build
   ```

**Reset demo data:** run `supabase/seed.sql` again. It is safe to re-run.

## Supported import files

`.md`, `.markdown` and `.txt`, up to 1 MB. Code blocks, tables and links are imported as plain text, since the editor doesn't support those blocks.

## Not implemented (deliberate scope cuts)

- **Real authentication.** The brief allows simulated users, and a login flow would have taken time away from sharing and permissions, which the brief evaluates directly.
- **Real-time collaboration.** Two people editing the same document at once is last-write-wins. The next step would be Yjs (a CRDT) with a sync server.
- **Version history, comments, search, export.** Useful, but each one is a feature of its own. I chose depth in editing, import and sharing instead.
- **Images and .docx import.** `.md`/`.txt` import covers the "turn a file into a document" flow without storage buckets or a heavy parser.
- **Mobile layout beyond basic usability.** The sidebar collapses into a drawer on small screens, but the app is desktop-first.

## Known limitations

- The current user is stored in a cookie. Anyone can switch users, which is intentional for the demo, but it is not security.
- Concurrent edits on the same document overwrite each other (last write wins).
- Sharing works between the three seeded users only.
- All reviewers share the same demo database, so documents may be changed or deleted by others. Re-run `supabase/seed.sql` to restore the sample.

## What I would build next (2–4 hours)

1. Supabase Auth with RLS policies, replacing the cookie-based demo users.
2. Real-time presence (who's viewing) and then Yjs-based collaborative editing.
3. Export to Markdown and PDF.
4. Version history using periodic content snapshots.
5. `.docx` import.

## Project docs

- [ARCHITECTURE.md](ARCHITECTURE.md): what I prioritized and why
- [AI-WORKFLOW.md](AI-WORKFLOW.md): how I used AI tools
