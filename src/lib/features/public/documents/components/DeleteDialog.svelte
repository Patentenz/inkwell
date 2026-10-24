<script lang="ts">
	import Bezel from '#lib/components/ui/Bezel.svelte';

	interface Props {
		documentTitle: string;
		dialogEl: HTMLDialogElement | null;
		onClose: () => void;
		onBackdropClick: (event: MouseEvent) => void;
		onCancel: () => void;
		onConfirm: () => void;
	}

	let {
		documentTitle,
		dialogEl = $bindable(null),
		onClose,
		onBackdropClick,
		onCancel,
		onConfirm
	}: Props = $props();
</script>

<dialog
	bind:this={dialogEl}
	class="ink-dlg del-dlg"
	aria-labelledby="del-title"
	onclose={onClose}
	onclick={onBackdropClick}
>
	<div class="ink-dlg-shell">
		<Bezel size="lg">
			{#snippet header()}
				<h2 id="del-title" class="del-title">Delete document?</h2>
			{/snippet}
			<p class="del-lead">Delete "{documentTitle}"?</p>
			<p class="del-body">This permanently removes the document for everyone it's shared with.</p>
			{#snippet footer()}
				<div class="del-foot">
					<button type="button" class="del-cancel" onclick={onCancel}>Cancel</button>
					<button type="button" class="del-danger" onclick={onConfirm}>Delete</button>
				</div>
			{/snippet}
		</Bezel>
	</div>
</dialog>

<style>
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
</style>
