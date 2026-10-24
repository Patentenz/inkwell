<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		size: 'lg' | 'sm';
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
	}

	let { size, header, children, footer }: Props = $props();
</script>

<div class="bz" class:bz-lg={size === 'lg'} class:bz-sm={size === 'sm'}>
	{#if header}
		<div class="bz-hd">{@render header()}</div>
	{/if}
	<div class="bz-inner">{@render children()}</div>
	{#if footer}
		<div class="bz-ft">{@render footer()}</div>
	{/if}
</div>

<style>
	.bz {
		background: var(--bezel-outer);
		border: 1px solid var(--bezel-ring);
		box-shadow: var(--shadow-pop);
	}

	.bz-lg {
		border-radius: 28px;
	}

	.bz-lg .bz-hd {
		padding: 14px 18px 10px;
	}

	.bz-lg .bz-inner {
		margin: 0 6px 6px;
		padding: 20px;
		border-radius: 22px;
		background: var(--bezel-inner);
		border: 1px solid var(--bezel-inner-ring);
		box-shadow: var(--bezel-inner-shadow);
	}

	.bz-lg .bz-inner:first-child {
		margin-top: 6px;
	}

	.bz-lg .bz-ft {
		padding: 10px 18px 14px;
	}

	.bz-sm {
		border-radius: 14px;
		padding: 3px;
	}

	.bz-sm .bz-inner {
		padding: 4px;
		border-radius: 11px;
		background: var(--bezel-inner);
		border: 1px solid var(--bezel-inner-ring);
		box-shadow: var(--bezel-inner-shadow);
	}
</style>
