<script lang="ts">
	import { beforeNavigate, invalidate } from '$app/navigation';
	import { SIDEBAR_DEPENDS } from '#lib/constants/sidebar.ts';
	import { enhance } from '$app/forms';
	import { getContext } from 'svelte';
	import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
	import Cloud from '@lucide/svelte/icons/cloud';
	import CloudCheck from '@lucide/svelte/icons/cloud-check';
	import CloudOff from '@lucide/svelte/icons/cloud-off';
	import Eye from '@lucide/svelte/icons/eye';
	import FileText from '@lucide/svelte/icons/file-text';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Lock from '@lucide/svelte/icons/lock';
	import Menu from '@lucide/svelte/icons/menu';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Users from '@lucide/svelte/icons/users';
	import Editor from '#lib/features/editor/Editor.svelte';
	import Toolbar from '#lib/features/editor/Toolbar.svelte';
	import ShareDialog from '#lib/features/sharing/ShareDialog.svelte';
	import Bezel from '#lib/components/ui/Bezel.svelte';
	import { createContentAutosave } from '#lib/features/editor/content-autosave.svelte.ts';
	import {
		SIDEBAR_CONTEXT_KEY,
		type SidebarContext
	} from '#lib/components/shared/sidebar-context.ts';
	import UserMenu from '#lib/components/shared/UserMenu.svelte';
	import { toast } from '#lib/components/ui/toast.svelte.ts';
	import type { Attachment } from 'svelte/attachments';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const sidebar = getContext<SidebarContext>(SIDEBAR_CONTEXT_KEY);

	let editor = $state<TiptapEditor | null>(null);
	let titleDraft = $derived(data.document.title);
	let lastSavedAt = $state<Date | null>(null);
	let menuOpen = $state(false);
	let shareOpen = $state(false);
	let deleteConfirmOpen = $state(false);
	let menuEl = $state<HTMLDivElement | null>(null);
	let menuBtnEl = $state<HTMLButtonElement | null>(null);
	let menuItemEl = $state<HTMLButtonElement | null>(null);
	let deleteDialogEl = $state<HTMLDialogElement | null>(null);
	let deleteForm = $state<HTMLFormElement | null>(null);
	let titleFocusedOnce = $state(false);

	let lastSidebarInvalidateAt = 0;

	function scheduleSidebarRefresh(): void {
		const now = Date.now();
		if (now - lastSidebarInvalidateAt < 30_000) {
			return;
		}
		lastSidebarInvalidateAt = now;
		void invalidate(SIDEBAR_DEPENDS);
	}

	const autosave = createContentAutosave(() => data.document.id, {
		onSaved: scheduleSidebarRefresh
	});

	const canEdit = $derived(data.access === 'owner' || data.access === 'editor');
	const isOwner = $derived(data.access === 'owner');

	const lastSavedLabel = $derived(
		lastSavedAt
			? `Last saved at ${lastSavedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
			: ''
	);

	const accessChip = $derived.by(() => {
		if (data.access === 'owner') {
			return {
				label: 'Owned by you',
				tone: 'neutral' as const,
				icon: 'lock' as const
			};
		}
		if (data.access === 'editor') {
			return {
				label: `Shared by ${data.owner.name} · Can edit`,
				tone: 'shared' as const,
				icon: 'users' as const
			};
		}
		return {
			label: `Shared by ${data.owner.name} · View only`,
			tone: 'neutral' as const,
			icon: 'eye' as const
		};
	});

	$effect(() => {
		if (!data.document.id) {
			return;
		}
		autosave.reset();
		lastSavedAt = null;
		titleFocusedOnce = false;
	});

	$effect(() => {
		if (autosave.status === 'saved') {
			lastSavedAt = new Date();
		}
	});

	function onEditorChange(content: JSONContent): void {
		if (!canEdit) {
			return;
		}
		autosave.queue(content);
	}

	async function handleSaveShortcut(event: KeyboardEvent): Promise<void> {
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			event.preventDefault();
			if (canEdit) {
				await autosave.saveNow();
			}
		}
	}

	function onWindowKeydown(event: KeyboardEvent): void {
		onMenuKeydown(event);
		void handleSaveShortcut(event);
	}

	function shouldWarnLeave(): boolean {
		return (
			canEdit &&
			(autosave.status === 'unsaved' ||
				autosave.status === 'saving' ||
				autosave.status === 'failed')
		);
	}

	beforeNavigate(({ to, type }) => {
		if (!canEdit || !autosave.hasPendingChanges() || type === 'leave' || !to) {
			return;
		}

		autosave.flushForNavigation();
	});

	$effect(() => {
		function onBeforeUnload(event: BeforeUnloadEvent): void {
			if (!shouldWarnLeave()) {
				return;
			}
			event.preventDefault();
		}

		window.addEventListener('beforeunload', onBeforeUnload);
		return () => window.removeEventListener('beforeunload', onBeforeUnload);
	});

	async function commitTitle(): Promise<void> {
		const trimmed = titleDraft.trim();
		if (!trimmed) {
			titleDraft = data.document.title;
			return;
		}
		if (trimmed === data.document.title) {
			return;
		}

		const body = new FormData();
		body.set('title', trimmed);

		await fetch('?/rename', {
			method: 'POST',
			body,
			headers: { 'x-sveltekit-action': 'true' }
		});

		await invalidate(SIDEBAR_DEPENDS);
	}

	function onTitleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (event.currentTarget instanceof HTMLInputElement) {
				event.currentTarget.blur();
			}
		}
		if (event.key === 'Escape') {
			titleDraft = data.document.title;
			if (event.currentTarget instanceof HTMLInputElement) {
				event.currentTarget.blur();
			}
		}
	}

	function onTitleFocus(event: FocusEvent): void {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement) || !canEdit) {
			return;
		}
		if (titleFocusedOnce || data.document.title !== 'Untitled document') {
			return;
		}
		titleFocusedOnce = true;
		input.select();
	}

	const pageAttach: Attachment = (node) => {
		const onMouseDown = (event: Event): void => {
			if (!editor) {
				return;
			}
			const target = event.target;
			if (!(target instanceof HTMLElement) || target.closest('.ProseMirror')) {
				return;
			}
			editor.chain().focus('end').run();
		};

		node.addEventListener('mousedown', onMouseDown);
		return () => node.removeEventListener('mousedown', onMouseDown);
	};

	function toggleMenu(): void {
		menuOpen = !menuOpen;
	}

	function closeMenu(focusTrigger = false): void {
		menuOpen = false;
		if (focusTrigger) {
			menuBtnEl?.focus();
		}
	}

	function openDeleteConfirm(): void {
		closeMenu();
		deleteConfirmOpen = true;
	}

	function closeDeleteConfirm(): void {
		deleteConfirmOpen = false;
		deleteDialogEl?.close();
	}

	function submitDelete(): void {
		closeDeleteConfirm();
		toast.show('Document deleted');
		deleteForm?.requestSubmit();
	}

	function onDocumentClick(event: MouseEvent): void {
		if (!menuOpen) {
			return;
		}
		const target = event.target as Node;
		if (menuEl?.contains(target) || menuBtnEl?.contains(target)) {
			return;
		}
		closeMenu();
	}

	function onMenuKeydown(event: KeyboardEvent): void {
		if (!menuOpen) {
			return;
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			closeMenu(true);
			return;
		}
		if (event.key === 'Enter' && event.target === menuItemEl) {
			event.preventDefault();
			openDeleteConfirm();
		}
	}

	$effect(() => {
		document.addEventListener('click', onDocumentClick);
		return () => document.removeEventListener('click', onDocumentClick);
	});

	$effect(() => {
		if (!menuOpen) {
			return;
		}
		queueMicrotask(() => {
			menuItemEl?.focus();
		});
	});

	$effect(() => {
		const node = deleteDialogEl;
		if (!node) {
			return;
		}
		if (deleteConfirmOpen && !node.open) {
			node.showModal();
		}
		if (!deleteConfirmOpen && node.open) {
			node.close();
		}
	});

	function onDeleteDialogClose(): void {
		deleteConfirmOpen = false;
	}

	function onDeleteDialogClick(event: MouseEvent): void {
		if (event.target === deleteDialogEl) {
			deleteDialogEl?.close();
		}
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div class="doc">
	<header class="hd">
		<div class="hd-l">
			<button
				type="button"
				class="hd-menu"
				aria-label="Open sidebar"
				onclick={() => sidebar.openDrawer()}
			>
				<Menu size={20} />
			</button>
			<span class="hd-file"><FileText size={24} /></span>
			<input
				class="hd-title"
				class:hd-title-ro={!canEdit}
				type="text"
				bind:value={titleDraft}
				readonly={!canEdit}
				maxlength="200"
				aria-label="Document title"
				onkeydown={onTitleKeydown}
				onfocus={onTitleFocus}
				onblur={() => {
					if (canEdit) {
						void commitTitle();
					}
				}}
			/>

			{#if canEdit}
				<div class="hd-chip" title={lastSavedLabel}>
					{#if autosave.status === 'saved'}
						<CloudCheck size={16} />
						<span>Saved</span>
					{:else if autosave.status === 'saving'}
						<Loader2 size={16} class="spin" />
						<span>Saving…</span>
					{:else if autosave.status === 'unsaved'}
						<span class="hd-unsaved-ico"><Cloud size={16} /></span>
						<span>Unsaved changes</span>
					{:else}
						<span class="hd-err-ico"><CloudOff size={16} /></span>
						<span class="hd-err-t">Couldn't save</span>
						<button type="button" class="hd-retry" onclick={() => autosave.retry()}>Retry</button>
					{/if}
				</div>
			{/if}
		</div>

		<div class="hd-act">
			<div
				class="hd-access"
				class:hd-access-sh={accessChip.tone === 'shared'}
				class:hd-access-ro={accessChip.tone === 'neutral'}
			>
				{#if accessChip.icon === 'lock'}
					<Lock size={14} />
				{:else if accessChip.icon === 'users'}
					<Users size={14} />
				{:else}
					<Eye size={14} />
				{/if}
				<span>{accessChip.label}</span>
			</div>

			{#if isOwner}
				<button type="button" class="hd-share" onclick={() => (shareOpen = true)}>
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
						onclick={toggleMenu}
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
									onclick={openDeleteConfirm}
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
			{/if}

			<UserMenu users={data.users} current={data.user} />
		</div>
	</header>

	<div class="doc-tb">
		<Toolbar {editor} visible={canEdit} />
	</div>

	<div class="doc-canvas ink-scroll">
		{#key data.document.id}
			<div class="doc-page" {@attach pageAttach}>
				<Editor
					bind:editor
					content={data.document.content as JSONContent}
					editable={canEdit}
					onchange={onEditorChange}
				/>
			</div>
		{/key}
	</div>
</div>

{#if isOwner}
	<dialog
		bind:this={deleteDialogEl}
		class="ink-dlg del-dlg"
		aria-labelledby="del-title"
		onclose={onDeleteDialogClose}
		onclick={onDeleteDialogClick}
	>
		<div class="ink-dlg-shell">
			<Bezel size="lg">
				{#snippet header()}
					<h2 id="del-title" class="del-title">Delete document?</h2>
				{/snippet}
				<p class="del-lead">Delete "{data.document.title}"?</p>
				<p class="del-body">This permanently removes the document for everyone it's shared with.</p>
				{#snippet footer()}
					<div class="del-foot">
						<button type="button" class="del-cancel" onclick={() => deleteDialogEl?.close()}
							>Cancel</button
						>
						<button type="button" class="del-danger" onclick={submitDelete}>Delete</button>
					</div>
				{/snippet}
			</Bezel>
		</div>
	</dialog>

	<ShareDialog
		open={shareOpen}
		documentTitle={data.document.title}
		documentId={data.document.id}
		owner={data.owner}
		shares={data.shares}
		users={data.users}
		currentUserId={data.user.id}
		onclose={() => (shareOpen = false)}
	/>
{/if}

<style>
	.doc {
		display: grid;
		grid-template-rows: auto auto 1fr;
		height: 100%;
		min-height: 0;
		min-width: 0;
		overflow: hidden;
	}

	.doc-tb {
		padding: 0 16px 8px;
		min-height: 0;
		background: var(--bg-canvas);
	}

	.doc-tb:not(:has(:global(.tb))) {
		height: 0;
		padding: 0;
		overflow: hidden;
	}

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

	.hd-title {
		field-sizing: content;
		min-width: 120px;
		max-width: 480px;
		font-size: 18px;
		font-weight: 400;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		padding: 2px 6px;
		transition:
			border-color var(--motion-ui),
			outline-color var(--motion-ui);
	}

	.hd-title:not(.hd-title-ro):hover {
		border-color: var(--border);
	}

	.hd-title:not(.hd-title-ro):focus-visible {
		border-color: transparent;
		outline: 2px solid var(--brand);
		outline-offset: 0;
	}

	.hd-title-ro {
		cursor: default;
	}

	.hd-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.hd-unsaved-ico {
		display: inline-flex;
		color: var(--accent);
	}

	.hd-err-ico {
		display: inline-flex;
		color: var(--danger);
	}

	.hd-err-t {
		color: var(--danger);
	}

	.hd-retry {
		padding: 0;
		border: none;
		background: none;
		font-size: 13px;
		font-weight: 500;
		color: var(--brand);
		text-decoration: underline;
		text-underline-offset: 0.12em;
	}

	.hd-act {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		flex-shrink: 0;
	}

	.hd-access {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: var(--radius-pill);
		font-size: 13px;
		color: var(--text-muted);
		white-space: nowrap;
		max-width: min(280px, 36vw);
	}

	.hd-access span {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.hd-access-ro {
		background: var(--bg-toolbar);
	}

	.hd-access-sh {
		background: var(--brand-soft);
		color: var(--text);
	}

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

	.del-dlg {
		width: min(420px, calc(100vw - 32px));
	}

	.del-title {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
	}

	.del-lead {
		margin: 0 0 8px;
		font-size: 15px;
		font-weight: 500;
		color: var(--text);
	}

	.del-body {
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-muted);
	}

	.del-foot {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		width: 100%;
	}

	.del-cancel {
		height: 36px;
		padding: 0 18px;
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
		background: var(--bg-surface);
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		transition: background var(--motion-ui);
	}

	.del-cancel:hover {
		background: var(--bg-hover);
	}

	.del-danger {
		height: 36px;
		padding: 0 18px;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--danger);
		font-size: 14px;
		font-weight: 500;
		color: #fff;
		transition: filter var(--motion-ui);
	}

	.del-danger:hover {
		filter: brightness(0.92);
	}

	.doc-canvas {
		position: relative;
		min-height: 0;
		overflow-y: auto;
		padding: 16px 0 24px;
		background: var(--bg-canvas);
	}

	.doc-page {
		width: 816px;
		max-width: calc(100% - 32px);
		min-height: 1056px;
		margin: 0 auto 48px;
		padding: 96px;
		background: var(--bg-page);
		border: 1px solid rgba(60, 50, 30, 0.06);
		box-shadow: var(--shadow-page);
		border-radius: 0;
	}

	.doc-page :global(.tiptap) {
		font-family: var(--font-doc);
		font-size: 16px;
		line-height: 1.6;
		color: var(--text);
		outline: none;
		caret-color: var(--brand);
		min-height: 864px;
	}

	.doc-page :global(.tiptap)::selection,
	.doc-page :global(.tiptap *::selection) {
		background-color: rgba(45, 58, 140, 0.16);
		color: var(--text);
	}

	.doc-page :global(.tiptap p.is-editor-empty:first-child::before),
	.doc-page :global(.tiptap .is-editor-empty.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		color: var(--text-subtle);
	}

	.doc-page :global(.tiptap p) {
		margin: 0 0 8px;
		max-width: none;
	}

	.doc-page :global(.tiptap h1) {
		font-size: 30px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 20px 0 6px;
	}

	.doc-page :global(.tiptap h2) {
		font-size: 22px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 18px 0 6px;
	}

	.doc-page :global(.tiptap > :first-child) {
		margin-top: 0;
	}

	.doc-page :global(.tiptap ul),
	.doc-page :global(.tiptap ol) {
		margin: 0 0 8px;
		padding-left: 28px;
	}

	.doc-page :global(.tiptap li > p) {
		margin: 0;
	}

	.doc-page :global(.tiptap strong) {
		font-weight: 700;
	}

	@media screen and (max-width: 60rem) {
		.hd-menu {
			display: inline-flex;
		}

		.doc-page {
			padding: 48px 24px;
			width: 100%;
			max-width: calc(100% - 32px);
		}
	}

	@media screen and (max-width: 37.5rem) {
		.hd-title {
			max-width: 60vw;
		}

		.hd-access {
			display: none;
		}

		.doc-page {
			padding: 24px 16px;
		}
	}
</style>
