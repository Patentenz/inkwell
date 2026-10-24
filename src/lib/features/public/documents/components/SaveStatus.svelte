<script lang="ts">
	import Cloud from '@lucide/svelte/icons/cloud';
	import CloudCheck from '@lucide/svelte/icons/cloud-check';
	import CloudOff from '@lucide/svelte/icons/cloud-off';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import type { SaveStatus as AutosaveStatus } from '#lib/features/public/editor/content-autosave.svelte.ts';

	interface Props {
		status: AutosaveStatus;
		lastSavedLabel: string;
		onRetry: () => void;
	}

	let { status, lastSavedLabel, onRetry }: Props = $props();
</script>

<div class="hd-chip" title={lastSavedLabel}>
	{#if status === 'saved'}
		<CloudCheck size={16} />
		<span>Saved</span>
	{:else if status === 'saving'}
		<Loader2 size={16} class="spin" />
		<span>Saving…</span>
	{:else if status === 'unsaved'}
		<span class="hd-unsaved-ico"><Cloud size={16} /></span>
		<span>Unsaved changes</span>
	{:else}
		<span class="hd-err-ico"><CloudOff size={16} /></span>
		<span class="hd-err-t">Couldn't save</span>
		<button type="button" class="hd-retry" onclick={onRetry}>Retry</button>
	{/if}
</div>

<style>
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
</style>
