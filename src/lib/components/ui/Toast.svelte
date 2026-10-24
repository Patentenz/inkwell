<script lang="ts">
	import { toast } from '#lib/components/ui/toast.svelte.ts';
</script>

{#if toast.message}
	<div class="toast" role="status">{toast.message}</div>
{/if}

<style>
	.toast {
		position: fixed;
		left: 50%;
		bottom: 24px;
		transform: translateX(-50%);
		z-index: var(--z-toast);
		max-width: min(480px, calc(100vw - 32px));
		padding: 10px 16px;
		border-radius: var(--radius-pill);
		background: #323232;
		color: #fff;
		font-size: 14px;
		font-weight: 400;
		box-shadow: var(--shadow-pop);
		pointer-events: none;
	}
</style>
