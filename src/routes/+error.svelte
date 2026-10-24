<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- home URL stays / */
	import { page } from '$app/state';
	import { APP_NAME } from '#lib/constants/app.ts';

	const errorTitle = $derived(`Something went wrong · ${APP_NAME}`);
</script>

<svelte:head>
	<title>{errorTitle}</title>
</svelte:head>

<div class="err-fallback">
	<p class="err-fallback-msg">{page.error?.message ?? 'Something went wrong.'}</p>
	<a href="/" class="err-fallback-link">Back to documents</a>
</div>

<style>
	.err-fallback {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		min-height: 100dvh;
		padding: 24px;
		text-align: center;
		background: var(--bg-canvas);
	}

	.err-fallback-msg {
		margin: 0;
		font-size: 16px;
		color: var(--text);
	}

	.err-fallback-link {
		font-size: 14px;
		font-weight: 500;
		color: var(--brand);
	}
</style>
