<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import Bold from '@lucide/svelte/icons/bold';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Italic from '@lucide/svelte/icons/italic';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Redo2 from '@lucide/svelte/icons/redo-2';
	import Underline from '@lucide/svelte/icons/underline';
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import { modKeyLabel } from '#lib/features/editor/mod-key.ts';
	import Bezel from '#lib/components/ui/Bezel.svelte';

	interface Props {
		editor: Editor | null;
		visible?: boolean;
	}

	let { editor, visible = true }: Props = $props();

	let tick = $state(0);
	let styleOpen = $state(false);
	let styleMenuEl = $state<HTMLDivElement | null>(null);
	let styleBtnEl = $state<HTMLButtonElement | null>(null);
	let menuPos = $state({ top: 0, left: 0 });

	const mod = modKeyLabel();

	const blockOptions = [
		{ id: 'paragraph', label: 'Normal text' },
		{ id: 'h1', label: 'Heading 1' },
		{ id: 'h2', label: 'Heading 2' }
	] as const;

	$effect(() => {
		const current = editor;
		if (!current) {
			return;
		}

		const bump = (): void => {
			tick += 1;
		};

		current.on('transaction', bump);
		current.on('selectionUpdate', bump);

		return () => {
			current.off('transaction', bump);
			current.off('selectionUpdate', bump);
		};
	});

	function run(command: () => boolean): void {
		command();
	}

	function active(check: () => boolean): boolean {
		void tick;
		if (!editor) {
			return false;
		}
		return check();
	}

	function currentBlockLabel(): string {
		void tick;
		if (!editor) {
			return 'Normal text';
		}
		if (editor.isActive('heading', { level: 1 })) {
			return 'Heading 1';
		}
		if (editor.isActive('heading', { level: 2 })) {
			return 'Heading 2';
		}
		return 'Normal text';
	}

	function applyBlockStyle(id: (typeof blockOptions)[number]['id']): void {
		if (!editor) {
			return;
		}
		if (id === 'paragraph') {
			run(() => editor.chain().focus().setParagraph().run());
		} else if (id === 'h1') {
			run(() => editor.chain().focus().toggleHeading({ level: 1 }).run());
		} else {
			run(() => editor.chain().focus().toggleHeading({ level: 2 }).run());
		}
		styleOpen = false;
	}

	function updateMenuPos(): void {
		if (!styleBtnEl) {
			return;
		}
		const rect = styleBtnEl.getBoundingClientRect();
		menuPos = { left: rect.left, top: rect.bottom + 6 };
	}

	function toggleStyleMenu(): void {
		if (!styleOpen) {
			updateMenuPos();
		}
		styleOpen = !styleOpen;
	}

	$effect(() => {
		if (!styleOpen) {
			return;
		}
		updateMenuPos();
		const onLayout = (): void => updateMenuPos();
		window.addEventListener('resize', onLayout);
		window.addEventListener('scroll', onLayout, true);
		return () => {
			window.removeEventListener('resize', onLayout);
			window.removeEventListener('scroll', onLayout, true);
		};
	});

	function onDocumentClick(event: MouseEvent): void {
		if (!styleOpen) {
			return;
		}
		const target = event.target as Node;
		if (styleMenuEl?.contains(target) || styleBtnEl?.contains(target)) {
			return;
		}
		styleOpen = false;
	}

	$effect(() => {
		document.addEventListener('click', onDocumentClick);
		return () => document.removeEventListener('click', onDocumentClick);
	});
</script>

{#if visible && editor}
	<div class="tb ink-scroll" role="toolbar" aria-label="Formatting">
		<div class="tb-scroll">
			<div class="tb-g">
				<button
					type="button"
					class="tb-btn"
					title="Undo ({mod}+Z)"
					aria-label="Undo"
					disabled={!active(() => editor.can().undo())}
					onclick={() => run(() => editor.chain().focus().undo().run())}
				>
					<Undo2 size={18} />
				</button>
				<button
					type="button"
					class="tb-btn"
					title="Redo ({mod}+Shift+Z)"
					aria-label="Redo"
					disabled={!active(() => editor.can().redo())}
					onclick={() => run(() => editor.chain().focus().redo().run())}
				>
					<Redo2 size={18} />
				</button>
			</div>

			<div class="tb-div" aria-hidden="true"></div>

			<div class="tb-g tb-style">
				<button
					type="button"
					class="tb-style-btn"
					bind:this={styleBtnEl}
					aria-haspopup="menu"
					aria-expanded={styleOpen}
					aria-label="Block style"
					onclick={toggleStyleMenu}
				>
					<span class="tb-style-l">{currentBlockLabel()}</span>
					<ChevronDown size={16} />
				</button>
				{#if styleOpen}
					<div
						class="tb-menu"
						bind:this={styleMenuEl}
						role="menu"
						aria-label="Block styles"
						style:top="{menuPos.top}px"
						style:left="{menuPos.left}px"
					>
						<Bezel size="sm">
							{#snippet children()}
								{#each blockOptions as option (option.id)}
									<button
										type="button"
										class="mi tb-menu-i"
										class:tb-menu-i-h1={option.id === 'h1'}
										class:tb-menu-i-h2={option.id === 'h2'}
										role="menuitem"
										onclick={() => applyBlockStyle(option.id)}
									>
										{option.label}
									</button>
								{/each}
							{/snippet}
						</Bezel>
					</div>
				{/if}
			</div>

			<div class="tb-div" aria-hidden="true"></div>

			<div class="tb-g">
				<button
					type="button"
					class="tb-btn"
					class:tb-btn-a={active(() => editor.isActive('bold'))}
					title="Bold ({mod}+B)"
					aria-label="Bold"
					aria-pressed={active(() => editor.isActive('bold'))}
					onclick={() => run(() => editor.chain().focus().toggleBold().run())}
				>
					<Bold size={18} />
				</button>
				<button
					type="button"
					class="tb-btn"
					class:tb-btn-a={active(() => editor.isActive('italic'))}
					title="Italic ({mod}+I)"
					aria-label="Italic"
					aria-pressed={active(() => editor.isActive('italic'))}
					onclick={() => run(() => editor.chain().focus().toggleItalic().run())}
				>
					<Italic size={18} />
				</button>
				<button
					type="button"
					class="tb-btn"
					class:tb-btn-a={active(() => editor.isActive('underline'))}
					title="Underline ({mod}+U)"
					aria-label="Underline"
					aria-pressed={active(() => editor.isActive('underline'))}
					onclick={() => run(() => editor.chain().focus().toggleUnderline().run())}
				>
					<Underline size={18} />
				</button>
			</div>

			<div class="tb-div" aria-hidden="true"></div>

			<div class="tb-g">
				<button
					type="button"
					class="tb-btn"
					class:tb-btn-a={active(() => editor.isActive('bulletList'))}
					title="Bullet list ({mod}+Shift+8)"
					aria-label="Bullet list"
					aria-pressed={active(() => editor.isActive('bulletList'))}
					onclick={() => run(() => editor.chain().focus().toggleBulletList().run())}
				>
					<List size={18} />
				</button>
				<button
					type="button"
					class="tb-btn"
					class:tb-btn-a={active(() => editor.isActive('orderedList'))}
					title="Numbered list ({mod}+Shift+7)"
					aria-label="Numbered list"
					aria-pressed={active(() => editor.isActive('orderedList'))}
					onclick={() => run(() => editor.chain().focus().toggleOrderedList().run())}
				>
					<ListOrdered size={18} />
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.tb {
		height: 40px;
		margin: 0;
		padding: 0 8px;
		border-radius: var(--radius-pill);
		background: var(--bg-toolbar);
		overflow-x: auto;
		overflow-y: hidden;
	}

	.tb-scroll {
		display: flex;
		align-items: center;
		height: 40px;
		min-width: min-content;
		gap: 4px;
	}

	.tb-g {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.tb-style {
		position: relative;
	}

	.tb-style-btn {
		display: inline-flex;
		align-items: center;
		justify-content: flex-start;
		gap: 6px;
		width: auto;
		min-width: 112px;
		height: 28px;
		padding: 0 8px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text);
		font-size: 13px;
		transition: background var(--motion-ui);
	}

	.tb-style-btn:hover {
		background: var(--bg-hover);
	}

	.tb-style-l {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tb-menu {
		position: fixed;
		min-width: 160px;
		z-index: var(--z-dropdown);
	}

	.tb-menu-i {
		justify-content: flex-start;
	}

	.tb-menu-i-h1 {
		font-size: 20px;
		font-weight: 400;
	}

	.tb-menu-i-h2 {
		font-size: 16px;
		font-weight: 400;
	}

	.tb-div {
		width: 1px;
		height: 20px;
		background: #c7c7c7;
		flex-shrink: 0;
		margin: 0 2px;
	}

	.tb-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text);
		transition: background var(--motion-ui);
	}

	.tb-btn:hover:not(:disabled) {
		background: var(--bg-hover);
	}

	.tb-btn:disabled {
		opacity: 0.38;
		cursor: not-allowed;
	}

	.tb-btn-a {
		background: var(--bg-active);
		color: var(--brand);
	}
</style>
