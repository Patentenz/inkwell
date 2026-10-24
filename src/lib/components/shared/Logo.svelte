<script lang="ts">
	import PenLine from '@lucide/svelte/icons/pen-line';

	interface Props {
		size?: number;
	}

	let { size = 28 }: Props = $props();

	const iconSize = $derived(Math.round(size * (16 / 28)));
</script>

<span class="logo" style:width="{size}px" style:height="{size}px" aria-hidden="true">
	<PenLine size={iconSize} />
	<span class="logo-dot"></span>
</span>

<style>
	.logo {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: var(--brand);
		color: #fff;
		flex-shrink: 0;
	}

	.logo-dot {
		position: absolute;
		right: 1px;
		bottom: 1px;
		width: 6px;
		height: 6px;
		border-radius: var(--radius-pill);
		background: var(--accent);
		box-shadow: 0 0 0 1.5px var(--bg-canvas);
	}
</style>
