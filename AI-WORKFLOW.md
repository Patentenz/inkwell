# AI Workflow Note

## Tools

- **Claude** (chat): reading the brief, planning scope and data model, writing step-by-step implementation prompts, reviewing reports and debugging.
- **Cursor** (agent): implementing each step in the codebase, following my project's `AGENTS.md` rules.

I worked in small steps: plan → prompt → Cursor implements → I run and test → next step.

## Where AI sped things up

- Scaffolding the server services, form actions and types.
- The TipTap editor, toolbar and autosave logic.
- UI styling and the design tokens.
- Unit tests and the Markdown-to-TipTap converter.
- Timing instrumentation to profile slow navigation.

## What I changed or rejected

- **Rejected the first prompt.** Another AI tool generated a build prompt from the job description. When I read the actual brief, it was wrong: SQLite and local file uploads (which don't persist on Vercel), no deployment, no tests. I rewrote the plan around a deployable Supabase stack.
- **Wrong fix for a database error.** The AI suggested switching to a legacy service key. I checked the table grants instead: the server role was missing SELECT/INSERT/UPDATE/DELETE. Adding grants was the real fix.
- **A fix that wasn't on disk.** Cursor reported it had fixed the user switcher, but it still didn't work. I ran a read-only investigation instead of another fix. It showed the reported changes were never saved, and found the real bug: a strict UUID check rejected the seeded IDs, so every request reset the user to Alice. I now ask Cursor to paste the final code from disk after fixes.
- **Performance.** The first implementation ran 11 queries per page, with duplicate access checks. I had it measure first, then reduced it to one.
- **Structure.** One route file had grown to ~600 lines. I had it split into feature components following my template's conventions.
- **Design.** I rejected the first UI as too generic and directed a redesign with its own palette, rather than copying Google Docs.

## How I verified

- `npm run check`, `npm test` and `npm run build` after every step.
- Clicked through each flow myself as Alice, Bob and Charlie, including permission edges: viewer can't edit, revoked user gets a 404.
- Used DevTools (network requests, cookies) to confirm what the server actually did, not what the AI said it did.
- For bugs: investigation prompts that change nothing first, then a targeted fix.
- Re-tested the main flows on the live Vercel deployment.