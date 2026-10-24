<script lang="ts">
	import { Editor } from '@tiptap/core';
	import type { JSONContent } from '@tiptap/core';
	import type { Attachment } from 'svelte/attachments';
	import { untrack } from 'svelte';
	import { editorExtensions } from '#lib/features/public/editor/extensions.ts';

	interface Props {
		content: JSONContent;
		editable: boolean;
		onchange?: (content: JSONContent) => void;
		editor?: Editor | null;
	}

	// eslint-disable-next-line no-useless-assignment -- bindable editor instance for toolbar
	let { content, editable, onchange, editor = $bindable(null) }: Props = $props();

	let instance: Editor | null = null;

	function normalizeContent(raw: JSONContent): JSONContent {
		if (raw.type !== 'doc') {
			return raw;
		}
		const nodes = raw.content;
		if (!nodes || nodes.length === 0) {
			return { type: 'doc', content: [{ type: 'paragraph' }] };
		}
		return raw;
	}

	const attachEditor: Attachment = (element) => {
		instance = untrack(
			() =>
				new Editor({
					element,
					extensions: editorExtensions,
					content: normalizeContent(content),
					editable,
					onUpdate: ({ editor: current }) => {
						onchange?.(current.getJSON());
					}
				})
		);

		editor = instance;

		return () => {
			instance?.destroy();
			instance = null;
			editor = null;
		};
	};

	$effect(() => {
		instance?.setEditable(editable, false);
	});
</script>

<div class="ed">
	<div class="ed-body" {@attach attachEditor}></div>
</div>

<style>
	.ed {
		min-height: 100%;
	}

	.ed-body {
		min-height: 100%;
		outline: none;
	}

	.ed-body :global(.tiptap) {
		outline: none;
		min-height: 100%;
	}
</style>
