<script lang="ts">
	import { navigating } from '$app/state';

	let visible = $state(false);
	let width = $state(0);
	let delayId: ReturnType<typeof setTimeout> | undefined;
	let rafId: number | undefined;

	function clearTimers(): void {
		if (delayId !== undefined) {
			clearTimeout(delayId);
			delayId = undefined;
		}
		if (rafId !== undefined) {
			cancelAnimationFrame(rafId);
			rafId = undefined;
		}
	}

	$effect(() => {
		if (navigating.to) {
			clearTimers();
			width = 0;
			visible = false;
			delayId = setTimeout(() => {
				visible = true;
				width = 0;
				rafId = requestAnimationFrame(() => {
					width = 72;
				});
			}, 150);
		} else {
			clearTimers();
			if (visible) {
				width = 100;
				delayId = setTimeout(() => {
					visible = false;
					width = 0;
				}, 200);
			}
		}

		return () => clearTimers();
	});
</script>

{#if visible}
	<div class="nav-prog" aria-hidden="true" style:--w="{width}%"></div>
{/if}

<style>
	.nav-prog {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		z-index: var(--z-toast);
		background: var(--brand);
		width: var(--w);
		transition: width 0.35s ease;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-prog {
			width: 100%;
			transition: none;
		}
	}
</style>
