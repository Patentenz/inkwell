<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import Menu from '@lucide/svelte/icons/menu';
	import UserMenu from '#lib/components/shared/UserMenu.svelte';
	import type { User } from '#lib/types/user.ts';
	import AccessChip from '#lib/features/public/documents/components/AccessChip.svelte';
	import DocumentActionsMenu from '#lib/features/public/documents/components/DocumentActionsMenu.svelte';
	import SaveStatus from '#lib/features/public/documents/components/SaveStatus.svelte';
	import TitleInput from '#lib/features/public/documents/components/TitleInput.svelte';
	import type { SaveStatus as AutosaveStatus } from '#lib/features/public/editor/content-autosave.svelte.ts';

	interface AccessChipView {
		label: string;
		tone: 'neutral' | 'shared';
		icon: 'lock' | 'users' | 'eye';
	}

	interface Props {
		canEdit: boolean;
		isOwner: boolean;
		titleDraft: string;
		accessChip: AccessChipView;
		autosaveStatus: AutosaveStatus;
		lastSavedLabel: string;
		users: User[];
		user: User;
		menuOpen: boolean;
		menuEl: HTMLDivElement | null;
		menuBtnEl: HTMLButtonElement | null;
		menuItemEl: HTMLButtonElement | null;
		deleteForm: HTMLFormElement | null;
		onOpenSidebar: () => void;
		onTitleKeydown: (event: KeyboardEvent) => void;
		onTitleFocus: (event: FocusEvent) => void;
		onTitleBlur: () => void;
		onAutosaveRetry: () => void;
		onToggleMenu: () => void;
		onOpenDeleteConfirm: () => void;
		onShareOpen: () => void;
	}

	let {
		canEdit,
		isOwner,
		titleDraft = $bindable(),
		accessChip,
		autosaveStatus,
		lastSavedLabel,
		users,
		user,
		menuOpen,
		menuEl = $bindable(null),
		menuBtnEl = $bindable(null),
		menuItemEl = $bindable(null),
		deleteForm = $bindable(null),
		onOpenSidebar,
		onTitleKeydown,
		onTitleFocus,
		onTitleBlur,
		onAutosaveRetry,
		onToggleMenu,
		onOpenDeleteConfirm,
		onShareOpen
	}: Props = $props();
</script>

<header class="hd">
	<div class="hd-l">
		<button type="button" class="hd-menu" aria-label="Open sidebar" onclick={onOpenSidebar}>
			<Menu size={20} />
		</button>
		<span class="hd-file"><FileText size={24} /></span>
		<TitleInput
			{canEdit}
			bind:titleDraft
			onkeydown={onTitleKeydown}
			onfocus={onTitleFocus}
			onblur={onTitleBlur}
		/>
		{#if canEdit}
			<SaveStatus status={autosaveStatus} {lastSavedLabel} onRetry={onAutosaveRetry} />
		{/if}
	</div>

	<div class="hd-act">
		<AccessChip chip={accessChip} />

		{#if isOwner}
			<DocumentActionsMenu
				{menuOpen}
				bind:menuEl
				bind:menuBtnEl
				bind:menuItemEl
				bind:deleteForm
				{onToggleMenu}
				{onOpenDeleteConfirm}
				{onShareOpen}
			/>
		{/if}

		<UserMenu {users} current={user} />
	</div>
</header>

<style>
	.hd {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
		padding: 0 16px;
		gap: 12px;
		background: var(--bg-canvas);
		z-index: var(--z-sticky);
	}

	.hd-l {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		flex: 1;
	}

	.hd-menu {
		display: none;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text);
		transition: background var(--motion-ui);
	}

	.hd-menu:hover {
		background: var(--bg-hover);
	}

	.hd-file {
		display: inline-flex;
		color: var(--brand);
		flex-shrink: 0;
	}

	.hd-act {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		flex-shrink: 0;
	}

	@media screen and (max-width: 60rem) {
		.hd-menu {
			display: inline-flex;
		}
	}
</style>
