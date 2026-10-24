<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import Lock from '@lucide/svelte/icons/lock';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Bezel from '#lib/components/ui/Bezel.svelte';
	import { SIDEBAR_DEPENDS } from '#lib/constants/sidebar.ts';

	interface Props {
		menuOpen: boolean;
		menuEl: HTMLDivElement | null;
		menuBtnEl: HTMLButtonElement | null;
		menuItemEl: HTMLButtonElement | null;
		deleteForm: HTMLFormElement | null;
		onToggleMenu: () => void;
		onOpenDeleteConfirm: () => void;
		onShareOpen: () => void;
	}

	let {
		menuOpen,
		menuEl = $bindable(null),
		menuBtnEl = $bindable(null),
		menuItemEl = $bindable(null),
		deleteForm = $bindable(null),
		onToggleMenu,
		onOpenDeleteConfirm,
		onShareOpen
	}: Props = $props();
</script>

<button type="button" class="hd-share" onclick={onShareOpen}>
	<Lock size={16} />
	<span>Share</span>
</button>

<div class="hd-more">
	<button
		type="button"
		class="hd-more-btn"
		bind:this={menuBtnEl}
		aria-label="Document actions"
		aria-haspopup="menu"
		aria-expanded={menuOpen}
		onclick={onToggleMenu}
	>
		<MoreVertical size={18} />
	</button>
	{#if menuOpen}
		<div class="hd-pop" bind:this={menuEl} role="menu" aria-label="Document actions">
			<Bezel size="sm">
				<button
					type="button"
					class="mi hd-pop-i"
					role="menuitem"
					bind:this={menuItemEl}
					onclick={onOpenDeleteConfirm}
				>
					<Trash2 size={18} />
					<span>Delete document</span>
				</button>
			</Bezel>
		</div>
	{/if}
	<form
		bind:this={deleteForm}
		method="POST"
		action="?/delete"
		use:enhance={() => {
			return async ({ update }) => {
				await invalidate(SIDEBAR_DEPENDS);
				await update();
			};
		}}
		class="sr-only"
		aria-hidden="true"
	></form>
</div>

<style>
	.hd-share {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 36px;
		padding: 0 14px;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--brand);
		color: #fff;
		font-size: 14px;
		font-weight: 500;
		transition: background var(--motion-ui);
	}

	.hd-share:hover {
		background: var(--brand-hover);
	}

	.hd-more {
		position: relative;
	}

	.hd-more-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text);
		transition: background var(--motion-ui);
	}

	.hd-more-btn:hover {
		background: var(--bg-hover);
	}

	.hd-pop {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		min-width: 200px;
		z-index: var(--z-dropdown);
	}

	.hd-pop-i {
		color: var(--danger);
	}
</style>
