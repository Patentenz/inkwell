<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- static sample asset path */
	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Upload from '@lucide/svelte/icons/upload';
	import { toast } from '#lib/components/ui/toast.svelte.ts';
	import { SIDEBAR_DEPENDS } from '#lib/constants/sidebar.ts';

	interface Props {
		variant: 'sidebar' | 'home';
	}

	let { variant }: Props = $props();

	const MAX_BYTES = 1024 * 1024;

	let submitting = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);
	let formEl = $state<HTMLFormElement | null>(null);
	let pendingName = $state('');

	function allowedExtension(name: string): boolean {
		const lower = name.toLowerCase();
		return lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.txt');
	}

	function openPicker(): void {
		fileInput?.click();
	}

	function onFileChange(): void {
		const file = fileInput?.files?.[0];
		if (!file) {
			return;
		}
		pendingName = file.name;
		if (!allowedExtension(file.name)) {
			toast.show('Only .md and .txt files are supported.');
			if (fileInput) {
				fileInput.value = '';
			}
			return;
		}
		if (file.size > MAX_BYTES) {
			toast.show('File is larger than 1 MB.');
			if (fileInput) {
				fileInput.value = '';
			}
			return;
		}
		formEl?.requestSubmit();
	}
</script>

<form
	bind:this={formEl}
	method="POST"
	action="/?/import"
	enctype="multipart/form-data"
	class:imp-f-sb={variant === 'sidebar'}
	class:imp-f-home={variant === 'home'}
	use:enhance={() => {
		submitting = true;
		return async ({ result }) => {
			submitting = false;
			if (result.type === 'redirect') {
				const label = pendingName || 'file';
				toast.show(`Imported "${label}"`);
				pendingName = '';
				if (fileInput) {
					fileInput.value = '';
				}
				await goto(result.location, { invalidateAll: false });
				await invalidate(SIDEBAR_DEPENDS);
				return;
			}
			pendingName = '';
			if (fileInput) {
				fileInput.value = '';
			}
			if (result.type === 'failure') {
				const message =
					typeof result.data?.message === 'string' ? result.data.message : 'Could not import file.';
				toast.show(message);
			}
			await applyAction(result);
		};
	}}
>
	<input
		bind:this={fileInput}
		type="file"
		name="file"
		accept=".md,.markdown,.txt,text/plain,text/markdown"
		class="imp-in"
		onchange={onFileChange}
	/>

	<button
		type="button"
		class="imp-btn"
		class:imp-btn-sb={variant === 'sidebar'}
		class:imp-btn-home={variant === 'home'}
		disabled={submitting}
		onclick={openPicker}
	>
		{#if submitting}
			<Loader2 size={18} class="imp-spin" />
			Importing…
		{:else}
			<Upload size={18} />
			Import file
		{/if}
	</button>

	{#if variant === 'sidebar'}
		<p class="imp-hint" title="Try the sample meeting-notes.md file">
			.md or .txt · max 1 MB ·
			<a
				href="/samples/meeting-notes.md"
				class="imp-sample"
				title="Download sample meeting-notes.md"
				download
			>
				Sample file
			</a>
		</p>
	{/if}
</form>

<style>
	.imp-in {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.imp-f-sb {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 6px;
		margin: 0 12px 16px;
	}

	.imp-f-home {
		display: inline-flex;
	}

	.imp-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border-radius: var(--radius-pill);
		font-size: 14px;
		font-weight: 500;
		transition:
			background var(--motion-ui),
			border-color var(--motion-ui),
			opacity var(--motion-ui);
	}

	.imp-btn:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.imp-btn-sb {
		width: 100%;
		height: 40px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text);
	}

	.imp-btn-sb:hover:not(:disabled) {
		background: var(--bg-hover);
	}

	.imp-btn-home {
		height: 40px;
		padding: 0 18px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text);
	}

	.imp-btn-home:hover:not(:disabled) {
		background: var(--bg-hover);
	}

	.imp-hint {
		margin: 0;
		padding: 0 4px;
		font-size: 12px;
		color: var(--text-muted);
		text-align: center;
	}

	.imp-sample {
		color: var(--brand);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.imp-sample:hover {
		color: var(--brand-hover);
	}

	:global(.imp-spin) {
		animation: imp-rot 0.8s linear infinite;
	}

	@keyframes imp-rot {
		to {
			transform: rotate(360deg);
		}
	}
</style>
