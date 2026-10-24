<script lang="ts">
	import { beforeNavigate, invalidate } from '$app/navigation';
	import { SIDEBAR_DEPENDS } from '#lib/constants/sidebar.ts';
	import { getContext, untrack } from 'svelte';
	import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
	import ShareDialog from '#lib/features/public/sharing/ShareDialog.svelte';
	import { createContentAutosave } from '#lib/features/public/editor/content-autosave.svelte.ts';
	import {
		SIDEBAR_CONTEXT_KEY,
		type SidebarContext
	} from '#lib/features/public/workspace/sidebar-context.ts';
	import { APP_NAME } from '#lib/constants/app.ts';
	import { toast } from '#lib/components/ui/toast.svelte.ts';
	import type { Attachment } from 'svelte/attachments';
	import type { DocumentViewData } from '#lib/types/document-view.ts';
	import DocumentCanvas from '#lib/features/public/documents/components/DocumentCanvas.svelte';
	import DocumentHeader from '#lib/features/public/documents/components/DocumentHeader.svelte';
	import DeleteDialog from '#lib/features/public/documents/components/DeleteDialog.svelte';
	import {
		commitDocumentTitle,
		handleDocumentTitleFocus,
		handleDocumentTitleKeydown
	} from '#lib/features/public/documents/document-title.svelte.ts';

	interface Props {
		data: DocumentViewData;
		documentTabTitle?: string;
	}

	// eslint-disable-next-line no-useless-assignment -- bindable tab title for route head
	let { data, documentTabTitle = $bindable('') }: Props = $props();

	const sidebar = getContext<SidebarContext>(SIDEBAR_CONTEXT_KEY);

	let editor = $state<TiptapEditor | null>(null);
	let titleDraft = $state('');

	$effect(() => {
		const id = data.document.id;
		if (!id) {
			return;
		}
		titleDraft = untrack(() => data.document.title);
	});

	$effect(() => {
		const id = data.document.id;
		if (!id) {
			return;
		}
		const label = titleDraft.trim() || 'Untitled document';
		sidebar.setActiveDocumentTitle({ documentId: id, title: label });
		return () => sidebar.setActiveDocumentTitle(null);
	});
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
		const title = titleDraft.trim() || 'Untitled document';
		const dirty = autosave.status === 'unsaved' || autosave.status === 'saving' ? '• ' : '';
		documentTabTitle = `${dirty}${title} · ${APP_NAME}`;
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
		await commitDocumentTitle(titleDraft, data.document.title, (value) => {
			titleDraft = value;
		});
	}

	function onTitleKeydown(event: KeyboardEvent): void {
		handleDocumentTitleKeydown(event, data.document.title, (value) => {
			titleDraft = value;
		});
	}

	function onTitleFocus(event: FocusEvent): void {
		handleDocumentTitleFocus(event, {
			canEdit,
			storedTitle: data.document.title,
			titleFocusedOnce,
			setTitleFocusedOnce: (value) => {
				titleFocusedOnce = value;
			}
		});
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
	<DocumentHeader
		{canEdit}
		{isOwner}
		bind:titleDraft
		{accessChip}
		autosaveStatus={autosave.status}
		{lastSavedLabel}
		users={data.users}
		user={data.user}
		{menuOpen}
		bind:menuEl
		bind:menuBtnEl
		bind:menuItemEl
		bind:deleteForm
		onOpenSidebar={() => sidebar.openDrawer()}
		{onTitleKeydown}
		{onTitleFocus}
		onTitleBlur={() => {
			if (canEdit) {
				void commitTitle();
			}
		}}
		onAutosaveRetry={() => autosave.retry()}
		onToggleMenu={toggleMenu}
		onOpenDeleteConfirm={openDeleteConfirm}
		onShareOpen={() => (shareOpen = true)}
	/>

	<DocumentCanvas
		documentId={data.document.id}
		content={data.document.content as JSONContent}
		{canEdit}
		bind:editor
		{pageAttach}
		onchange={onEditorChange}
	/>
</div>

{#if isOwner}
	<DeleteDialog
		documentTitle={data.document.title}
		bind:dialogEl={deleteDialogEl}
		onClose={onDeleteDialogClose}
		onBackdropClick={onDeleteDialogClick}
		onCancel={() => deleteDialogEl?.close()}
		onConfirm={submitDelete}
	/>

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
</style>
