<!-- BEGIN:sveltekit-agent-rules -->

# SvelteKit starter template

Copy this repository when starting a new app. The codebase and these rules follow **SvelteKit 3** and **Svelte 5 runes** so new work stays on current syntax, not legacy Svelte 4 or Kit 2 patterns.

Before writing code:

- Read and follow `README.md` and any project documentation.
- If the task involves Svelte or SvelteKit APIs, use the Svelte MCP documentation tools before writing code.
- Follow this project's architecture and conventions instead of generic Svelte examples.
- Respect any deprecation notices and avoid legacy Svelte syntax.

# Stack

- SvelteKit 3
- Svelte 5 (runes mode is forced for app code in `vite.config.ts`)
- TypeScript (strict mode)
- Custom CSS (`src/app.css`)
- Vitest (unit + component)
- `@sveltejs/adapter-auto` (swap for a specific host when needed)

# Svelte MCP

When working with Svelte or SvelteKit:

1. Use **list-sections** to discover relevant documentation.
2. Read every relevant section using **get-documentation**.
3. Run **svelte-autofixer** before returning code.
4. Continue fixing issues until none remain.
5. Generate a Playground link only if the user explicitly requests one.

# Svelte 5

Write runes-mode Svelte 5.

Use:

- `$state` for values that the template, an `$effect`, or a `$derived` must track. Use `$state.raw` for large objects that are replaced instead of mutated.
- `$derived` for values computed from state. Use `$derived.by` when the computation needs a function body.
- `$props`, typed on the binding: `let { title, count = 0 }: Props = $props()`
- `onclick`, `oninput`, `onsubmit`, and other `on` event attributes
- `{#snippet}` and `{@render}`
- `PageProps` and `LayoutProps` from `./$types` in route components
- `.svelte.ts` modules for shared reactive logic
- `createContext` when state should be scoped to a subtree
- keyed `{#each}` blocks, with a key that identifies the item

`$effect` is an escape hatch. Do not use it to copy one piece of state into another. Prefer an event handler, `{@attach}`, or `$derived`.

Example:

```svelte
<script lang="ts">
	interface Props {
		title: string
		count?: number
	}

	let { title, count = 0 }: Props = $props()
</script>
```

Never use:

- `export let`, `$$props`, or `$$restProps`
- `$:`
- `on:click`, `on:input`, or other `on:` directives
- `createEventDispatcher`
- `<slot>`, `$$slots`, or `<svelte:fragment>`
- `<svelte:component>` or `<svelte:self>`
- `use:action` (`{@attach}` replaces it)
- the `class:` directive
- Svelte stores for new shared state
- `$app/stores` (removed in SvelteKit 3; use `$app/state`)
- Legacy Svelte APIs unless explicitly requested.

# Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── shared/                   # Shared app components (header, footer, logo)
│   │   └── ui/                       # Reusable UI components (buttons, inputs, dialogs)
│   │
│   ├── constants/                    # Static values shared across the application
│   │   ├── app.ts                    # App name, description, and default settings
│   │   ├── index.ts                  # Central exports for constants
│   │   ├── navigation.ts             # Navigation links and menu configuration
│   │   └── routes.ts                 # Centralized route paths
│   │
│   ├── features/                     # Feature-specific components and logic
│   │   ├── admin/
│   │   │   └── components/           # Admin-specific UI components
│   │   ├── auth/                     # Authentication UI and related logic
│   │   └── public/                   # Public-facing website features
│   │       ├── components/           # Shared public page components
│   │       ├── contact/              # Contact page components and logic
│   │       └── homepage/             # Homepage composition and sections
│   │           ├── sections/         # Homepage sections (hero, about, services)
│   │           │   └── Hero.svelte   # Homepage hero section
│   │           └── Homepage.svelte   # Main component that assembles homepage sections
│   │
│   ├── server/                       # Server-only code and privileged operations
│   │   ├── auth/                     # Server-side authentication and authorization
│   │   ├── db/                       # Database connections and queries
│   │   └── services/                 # Server-side business logic and operations
│   │
│   ├── types/                        # Shared TypeScript types and interfaces
│   └── utils/                        # General helper functions (formatting, dates, strings)
│
├── routes/                           # SvelteKit pages, layouts, and endpoints
│   ├── (auth)/                       # Authentication routes (login, register)
│   ├── (public)/                     # Public-facing routes
│   │   ├── contact/                  # Contact page route
│   │   └── +page.svelte              # Homepage route (/)
│   └── +layout.svelte                # Root layout shared across routes
│
├── app.css                           # Global styles and design tokens
├── app.d.ts                          # Global TypeScript declarations and app locals types
├── app.html                          # Base HTML document template
└── env.ts                            # Environment variables (`defineEnvVars`)
```
```
static/
├── img/
├── logo/
├── favicon.svg
└── robots.txt
```



- `src/routes` — routes. Route-only components can live next to the route.
- `src/lib` — shared code. Import with the `#lib` alias and a file extension.
- `src/lib/server` or `*.server.ts` — server-only; never import from client code.
- `src/hooks.server.ts` / `src/hooks.client.ts` — optional; sit in `src/`, not under `routes/`.

```ts
import { something } from '#lib/something.ts'
```

`$lib` is not configured. Do not import from it.

Add folders such as `components/`, `features/`, or `types/` under `src/lib` as the app grows.

# Routing

Keep route files inside `src/routes`. A route file has a `+` prefix:

- `+page.svelte`
- `+layout.svelte`
- `+page.server.ts`
- `+page.ts`
- `+layout.server.ts`
- `+layout.ts`
- `+server.ts`
- `+error.svelte`

`src/hooks.server.ts` and `src/hooks.client.ts` sit beside `src/routes`, not inside it.

Shared code belongs in `#lib`. Server-only code belongs in `#lib/server` or in a `*.server.ts` module.

Type a page with `PageProps` and a layout with `LayoutProps`, both from `./$types`:

```svelte
<script lang="ts">
	import type { LayoutProps } from './$types'

	let { children }: LayoutProps = $props()
</script>

{@render children()}
```

# Design Tokens

`src/app.css` is the global stylesheet, imported once from the root `+layout.svelte`. Define shared colors, typography, radius, shadows, and z-index there as CSS variables, then use those variables from a component `<style>` block.

```css
color: var(--color-primary);
```

Use the `style:` directive when a component needs to pass a value into its CSS. Base resets belong in `src/app.css`.

# Styling

Use a scoped `<style>` block for CSS that is specific to one component.

Pass a dynamic value into that CSS with the `style:` directive, then read it with `var(--name)`.

Do not use the `style` attribute.

Use short, scoped class names.

Examples:

```
hr
hr-w
hr-c
hr-t
hr-btn

ft
ft-w
ft-nav

cta
cta-c
cta-btn
```

Avoid verbose names such as:

```
homepage-hero-section
footer-navigation-container
template-card-wrapper
```

Keep class names short, readable, and consistent.

# Data Loading

Server `load` functions live in `+page.server.ts` and `+layout.server.ts`. They always run on the server. Use them for database access and private environment variables. Type them with `PageServerLoad` or `LayoutServerLoad` from `./$types`.

Universal `load` functions live in `+page.ts` and `+layout.ts`. They run on the server during SSR and in the browser during client-side navigation. Type them with `PageLoad` or `LayoutLoad` from `./$types`.

Read the result in the page or layout through the `data` prop from `PageProps` or `LayoutProps`.

Mutations from a page form belong in `actions` in `+page.server.ts`, typed with `Actions` from `./$types`.

Remote functions (`query`, `form`, `command`, and `prerender` from `$app/server`) are experimental. They are not enabled. Do not add them unless the task asks for them, and then enable `experimental.remoteFunctions` and `compilerOptions.experimental.async` on the `sveltekit()` plugin in `vite.config.ts`.

Use `page`, `navigating`, and `updated` from `$app/state`. Do not import `$app/stores`.

Do not keep shared mutable state in a server module. Do not cause side effects inside `load`.

Prefer `+page.server.ts` over a `+server.ts` endpoint unless the task is a public API. `json()` and `text()` from `@sveltejs/kit` are deprecated; return `Response.json()` or `new Response()`.

# TypeScript

Strict mode is enabled.

Never use:

- `any`
- `@ts-ignore`

All exported functions should have explicit return types.

Use:

- `interface` for object shapes
- `type` for unions and utility types

# Environment Variables

Declare every variable in `src/env.ts` with `defineEnvVars` from `@sveltejs/kit/env`. Private is the default. Set `public: true` for values that are safe to send to the browser. Set `static: true` only when the value should be inlined at build time.

Private:

```ts
import { API_KEY } from '$app/env/private'
```

Public:

```ts
import { PUBLIC_SITE_URL } from '$app/env/public'
```

`$app/env/private` can only be imported from server code.

Do not import `$env/static/private`, `$env/static/public`, `$env/dynamic/private`, or `$env/dynamic/public`. Those modules are deprecated.

Never hardcode secrets.

Never commit `.env` files.

# Deployment

Pass SvelteKit configuration to the `sveltekit()` plugin in `vite.config.ts`. `svelte.config.js` is not supported.

This project uses `@sveltejs/adapter-auto`. That adapter selects the platform adapter at deploy time, including Vercel.

Install `@sveltejs/adapter-vercel` and pass it to `sveltekit()` only when a Vercel-specific option is required. Prefer the Node.js runtime. Use the Edge runtime only when the route requires it.

Configure environment variables in the Vercel dashboard, and declare those same names in `src/env.ts`.

# Code Output Rules

- Write clean, scalable, production-ready code.
- No comments.
- No explanations.
- No placeholder implementations.
- No mock code.
- No unnecessary JavaScript.
- Prefer CSS over JavaScript whenever possible.
- Make surgical changes only.
- Do not refactor unrelated code.
- Output only the final code unless the user explicitly requests an explanation.

<!-- END:sveltekit-agent-rules -->