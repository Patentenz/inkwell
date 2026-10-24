<script lang="ts">
	import { navigating, page } from '$app/state';
	import NavProgress from '#lib/components/shared/NavProgress.svelte';
	import Toast from '#lib/components/ui/Toast.svelte';
	import { APP_DESCRIPTION, APP_NAME } from '#lib/constants/app.ts';
	import Sidebar from '#lib/features/public/workspace/Sidebar.svelte';
	import {
		SIDEBAR_CONTEXT_KEY,
		type SidebarContext
	} from '#lib/features/public/workspace/sidebar-context.ts';
	import { setContext } from 'svelte';
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

<svelte:head>
	<title>{APP_NAME}</title>
	<meta name="description" content={APP_DESCRIPTION} />
	<meta name="theme-color" content="#2d3a8c" />
</svelte:head>

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

	<Sidebar
		ownedDocuments={data.ownedDocuments}
		sharedDocuments={data.sharedDocuments}
		{drawerOpen}
		{isActive}
		onCloseDrawerOnNav={closeDrawerOnNav}
	/>

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
