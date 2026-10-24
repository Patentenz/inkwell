# Architecture Note

## What I prioritized

The brief rewards depth over breadth, so I focused on three things working end to end:

1. **An editor that feels like a real product:** page-on-canvas layout, a proper toolbar, inline title, and autosave with a clear status.
2. **Sharing with permissions enforced on the server,** not just hidden in the UI.
3. **A deployed build reviewers can test without setup.**

Real auth, real-time collaboration and version history were cut on purpose (see README).

## Stack and why

| Choice | Reason |
|---|---|
| SvelteKit + TypeScript | The stack I ship with daily, so time went into the product, not the tooling. Server load functions and form actions keep data access on the server. |
| TipTap v3 | Mature editor built on ProseMirror. Content is structured JSON, which makes validation and import straightforward. |
| Supabase Postgres | Free, managed Postgres. SQLite or a local file store would not survive on Vercel's serverless filesystem. |
| Vercel | Zero-config deploys for SvelteKit, free for reviewers. |

## Data model

```
users            id, name, email
documents        id, owner_id → users, title (1–200 chars), content (jsonb, TipTap JSON), created_at, updated_at
document_shares  document_id → documents, user_id → users, role ('viewer' | 'editor'), PK (document_id, user_id)
```

- Content is stored as TipTap JSON, not HTML. It round-trips without loss and there is no stored HTML to sanitize.
- Deleting a document cascades to its shares.
- `updated_at` is maintained by a trigger.

## Access control

- **The browser never talks to the database.** All reads and writes go through SvelteKit server code using the Supabase secret key.
- RLS is enabled on every table with **no policies**, and table grants exist only for the server role. Even if the public key leaked, it could not read anything.
- Access is decided by one pure function, `resolveAccess(ownerId, shares, userId)`, which returns `owner`, `editor`, `viewer` or nothing. Every load and mutation uses it:
  - view: owner, editor, viewer (otherwise 404, so document IDs don't leak)
  - edit content / rename: owner, editor (otherwise 403)
  - share, change role, revoke, delete: owner only
- The current user comes from a cookie set by the user switcher. It's a demo stand-in for auth; replacing it with Supabase Auth would only change how the user ID is resolved.

## Request flow

- Pages load data in `+page.server.ts` / `+layout.server.ts`.
- Mutations use SvelteKit form actions (create, rename, delete, share, import, switch user).
- Autosave is the one JSON endpoint: `PATCH /api/documents/[id]`, because it's called frequently from the client. It validates the content shape and rejects payloads over 1 MB.

## Autosave

Saves 1.5s after the last change. Each request carries a sequence number, so a slow older response can't overwrite the status of a newer save. Navigating away fires any pending save immediately without blocking navigation; closing the tab with unsaved changes shows a browser warning.

## File import

Uploading `.md`/`.txt` creates a new document. The file is validated on the server (extension, 1 MB limit, empty file, binary content), then converted from Markdown tokens (`marked` lexer) to TipTap JSON. The converter is a pure function with unit tests. The title comes from the first H1, or the file name.

## Performance fix

Navigation felt slow, so I instrumented every query. Opening a document took **11 database round trips**, including 4 duplicate access checks, at ~180 ms each from my location. I changed it to **one query** that loads the document, owner and shares together, then resolves access in memory. I also stopped the sidebar from reloading on every navigation (it now refreshes only when its data changes) and removed a per-request user lookup.

## Testing

Vitest unit tests cover the logic where a bug would matter most:

- `access.spec.ts`: owner/editor/viewer/no-access resolution
- `share-rules.spec.ts`: only owners can share, no sharing with yourself, valid roles
- `validation.spec.ts`: document content shape and size limits
- `import-validation.spec.ts` and `markdown-to-doc.spec.ts`: file rules and Markdown conversion
- `ids.spec.ts`: ID format checks (this caught a real bug, see AI-WORKFLOW.md)

## Project structure

Routes stay thin and only load data and compose components. UI lives in `src/lib/features/public/` (documents, editor, sharing, import, workspace) and server code in `src/lib/server/` (db, auth, services).