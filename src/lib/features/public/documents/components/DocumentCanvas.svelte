<script lang="ts">
	import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
	import type { Attachment } from 'svelte/attachments';
	import Editor from '#lib/features/public/editor/Editor.svelte';
	import Toolbar from '#lib/features/public/editor/Toolbar.svelte';

	interface Props {
		documentId: string;
		content: JSONContent;
		canEdit: boolean;
		editor: TiptapEditor | null;
		pageAttach: Attachment;
		onchange: (content: JSONContent) => void;
	}

	let {
		documentId,
		content,
		canEdit,
		editor = $bindable(null),
		pageAttach,
		onchange
	}: Props = $props();
</script>

<div class="doc-tb">
	<Toolbar {editor} visible={canEdit} />
</div>

<div class="doc-canvas ink-scroll">
	{#key documentId}
		<div class="doc-page" {@attach pageAttach}>
			<Editor bind:editor {content} editable={canEdit} {onchange} />
		</div>
	{/key}
</div>

<style>
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
		.doc-page {
			padding: 48px 24px;
			width: 100%;
			max-width: calc(100% - 32px);
		}
	}

	@media screen and (max-width: 37.5rem) {
		.doc-page {
			padding: 24px 16px;
		}
	}
</style>
