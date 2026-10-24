<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import NavProgress from '#lib/components/shared/NavProgress.svelte';
	import { SIDEBAR_DEPENDS } from '#lib/constants/sidebar.ts';
	import { setContext } from 'svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import FileText from '@lucide/svelte/icons/file-text';
	import Users from '@lucide/svelte/icons/users';
	import Logo from '#lib/components/shared/Logo.svelte';
	import Toast from '#lib/components/ui/Toast.svelte';
	import { formatEditedLabel } from '#lib/utils/relative-time.ts';
	import { SIDEBAR_CONTEXT_KEY, type SidebarContext } from '#lib/components/shared/sidebar-context.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let drawerOpen = $state(false);

	const sidebarContext: SidebarContext = {
		openDrawer: () => {
			drawerOpen = true;
		},
		closeDrawer: () => {
			drawerOpen = false;
		}
	};

	setContext(SIDEBAR_CONTEXT_KEY, sidebarContext);

	const activeId = $derived(navigating.to?.params?.id ?? page.params.id ?? null);

	function isActive(id: string): boolean {
		return activeId === id;
	}

	function closeDrawerOnNav(): void {
		drawerOpen = false;
	}

	function onScrimKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			drawerOpen = false;
		}
	}
</script>

<NavProgress />

<div class="app">
	{#if drawerOpen}
		<button
			type="button"
			class="scrim"
			aria-label="Close sidebar"
			onclick={() => (drawerOpen = false)}
			onkeydown={onScrimKeydown}
		></button>
	{/if}

	<aside class="sb" class:sb-open={drawerOpen}>
		<div class="sb-brand">
			<Logo size={28} />
			<span class="sb-name">Inkwell</span>
		</div>

		<form
			method="POST"
			action="/?/create"
			use:enhance={() => {
				return async ({ update }) => {
					await invalidate(SIDEBAR_DEPENDS);
					await update();
				};
			}}
			class="sb-new-f"
		>
			<button type="submit" class="sb-new">
				<Plus size={18} />
				New document
			</button>
		</form>

		<nav class="sb-nav ink-scroll">
			<section class="sb-sec">
				<h2 class="sb-sec-t">My documents</h2>
				<ul class="sb-list">
					{#each data.ownedDocuments as doc (doc.id)}
						<li>
							<a
								href="/docs/{doc.id}"
								class="sb-item sb-item-own"
								class:sb-item-a={isActive(doc.id)}
								onclick={closeDrawerOnNav}
							>
								<span class="sb-ico"><FileText size={18} /></span>
								<span class="sb-item-body">
									<span class="sb-item-t">{doc.title}</span>
									<span class="sb-item-sub">{formatEditedLabel(doc.updated_at)}</span>
								</span>
							</a>
						</li>
					{:else}
						<li class="sb-empty">No documents yet</li>
					{/each}
				</ul>
			</section>

			<section class="sb-sec">
				<h2 class="sb-sec-t">Shared with me</h2>
				<ul class="sb-list">
					{#each data.sharedDocuments as doc (doc.id)}
						<li>
							<a
								href="/docs/{doc.id}"
								class="sb-item sb-item-sh"
								class:sb-item-a={isActive(doc.id)}
								onclick={closeDrawerOnNav}
							>
								<span class="sb-ico"><Users size={18} /></span>
								<span class="sb-item-body">
									<span class="sb-item-t">{doc.title}</span>
									<span class="sb-item-sub"
										>{doc.owner_name} · {doc.role === 'editor' ? 'Editor' : 'Viewer'}</span
									>
								</span>
							</a>
						</li>
					{:else}
						<li class="sb-empty">Nothing shared yet</li>
					{/each}
				</ul>
			</section>
		</nav>
	</aside>

	<main class="main">
		{@render children()}
	</main>

	<Toast />
</div>

<style>
	.app {
		display: grid;
		grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
		height: 100dvh;
		overflow: hidden;
		background: var(--bg-canvas);
	}

	.sb {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		background: var(--bg-canvas);
		z-index: var(--z-drawer);
	}

	.sb-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 64px;
		padding: 0 20px;
		flex-shrink: 0;
	}

	.sb-name {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		letter-spacing: -0.01em;
	}

	.sb-new-f {
		margin: 8px 12px 16px;
	}

	.sb-new {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		height: 48px;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--brand-soft);
		color: var(--brand);
		font-size: 14px;
		font-weight: 500;
		box-shadow: var(--shadow-page);
		transition:
			box-shadow var(--motion-ui),
			background var(--motion-ui);
	}

	.sb-new:hover {
		box-shadow: var(--shadow-pop);
	}

	.sb-nav {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding-bottom: 8px;
	}

	.sb-sec {
		margin-bottom: 12px;
	}

	.sb-sec-t {
		margin: 0 0 6px;
		padding: 0 20px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.sb-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.sb-item {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 36px;
		margin-right: 12px;
		padding: 0 12px 0 20px;
		border-radius: 0 var(--radius-pill) var(--radius-pill) 0;
		text-decoration: none;
		color: var(--text);
		font-size: 14px;
		transition: background var(--motion-ui);
	}

	.sb-item-own,
	.sb-item-sh {
		height: 48px;
		align-items: flex-start;
		padding-top: 6px;
		padding-bottom: 6px;
	}

	.sb-item:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.sb-item-a {
		background: var(--bg-selected);
		box-shadow: inset 3px 0 0 var(--brand);
	}

	.sb-item-a .sb-item-t {
		font-weight: 600;
	}

	.sb-ico {
		display: inline-flex;
		color: var(--brand);
		flex-shrink: 0;
	}

	.sb-item-body {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sb-item-t {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 500;
	}

	.sb-item-sub {
		font-size: 12px;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sb-empty {
		padding: 6px 20px;
		font-size: 13px;
		color: var(--text-subtle);
	}

	.main {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		height: 100%;
		overflow: hidden;
		background: var(--bg-canvas);
	}

	.scrim {
		display: none;
	}

	@media screen and (max-width: 60rem) {
		.app {
			grid-template-columns: minmax(0, 1fr);
		}

		.sb {
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			width: var(--sidebar-w);
			height: 100dvh;
			max-height: none;
			overflow: hidden;
			transform: translateX(-100%);
			transition: transform var(--transition-base);
		}

		.sb-open {
			transform: translateX(0);
		}

		.scrim {
			display: block;
			position: fixed;
			inset: 0;
			border: none;
			padding: 0;
			background: rgba(31, 31, 31, 0.35);
			z-index: calc(var(--z-drawer) - 1);
		}
	}
</style>
