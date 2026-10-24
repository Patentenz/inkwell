# SvelteKit template

Personal starter for new projects: **SvelteKit 3**, **Svelte 5 runes**, TypeScript, custom CSS (`src/app.css`), Vitest, ESLint, and Prettier.

## Use this template

1. Copy this folder (or clone and remove `.git` if you want a fresh history).
2. Rename `package.json` `"name"` and update the repo remote.
3. Run `npm install`, then `npm run dev`.
4. Keep **`AGENTS.md`** in the copy so Cursor/agents follow the same SvelteKit 3 rules.

## Scripts

| Command                   | Purpose                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `npm run dev`             | Dev server                                                        |
| `npm run build`           | Production build                                                  |
| `npm run check`           | `svelte-check` + types                                            |
| `npm run test`            | Vitest (`src/**/*.spec.ts`, `*.svelte.spec.ts` when you add them) |
| `npm run lint` / `format` | ESLint / Prettier                                                 |

## Conventions (summary)

- Kit config lives in **`vite.config.ts`** (`sveltekit()` plugin), not `svelte.config.js`.
- Shared imports use **`#lib/...`** with extensions (see `package.json` `"imports"`).
- Env vars: declare in **`src/env.ts`**, import from **`$app/env/private`** or **`$app/env/public`**.
- Pages/layouts: **`PageProps`** / **`LayoutProps`** from `./$types`, **`$props()`**, **`{@render children()}`**.
- App state in components: **`$app/state`** (not `$app/stores`).

See **`AGENTS.md`** for full agent and coding rules.

## Recreate from scratch

Same stack as when this template was generated:

```sh
npx sv@1.1.1 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" --install npm .
```

Then merge in this repo’s `AGENTS.md`, `src/env.ts`, and any conventions you want to keep.
