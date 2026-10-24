<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import Plus from '@lucide/svelte/icons/plus';
	import ImportFileControl from '#lib/features/public/import/ImportFileControl.svelte';
	import Logo from '#lib/components/shared/Logo.svelte';
	import { SIDEBAR_DEPENDS } from '#lib/constants/sidebar.ts';
	import SidebarDocList from '#lib/features/public/workspace/SidebarDocList.svelte';
	import type { DocumentSummary, SharedDocumentSummary } from '#lib/types/document.ts';

	interface Props {
		ownedDocuments: DocumentSummary[];
		sharedDocuments: SharedDocumentSummary[];
		drawerOpen: boolean;
		isActive: (id: string) => boolean;
		onCloseDrawerOnNav: () => void;
	}

	let { ownedDocuments, sharedDocuments, drawerOpen, isActive, onCloseDrawerOnNav }: Props =
		$props();
</script>

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

	<ImportFileControl variant="sidebar" />

	<SidebarDocList {ownedDocuments} {sharedDocuments} {isActive} onNavigate={onCloseDrawerOnNav} />
</aside>

<style>
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
		margin: 8px 12px 8px;
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

	@media screen and (max-width: 60rem) {
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
	}
</style>
