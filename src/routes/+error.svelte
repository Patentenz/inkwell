<script lang="ts">
	import { page } from '$app/state';
	import UserMenu from '#lib/components/shared/UserMenu.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="shell">
	<header class="app-bar">
		<UserMenu users={data.users} current={data.user} />
	</header>

	<section class="err">
		<div class="err-ico" aria-hidden="true">
			{#if page.status === 404}
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linejoin="round"
					/>
					<path
						d="M14 2v6h6M9 13h6M9 17h4"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
			{:else}
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</div>

		{#if page.status === 404}
			<h1 class="err-h">Document not found</h1>
			<p class="err-p">It may have been deleted or your access was removed.</p>
		{:else if page.status === 403}
			<h1 class="err-h">You don't have permission to do that.</h1>
			<p class="err-p">Contact the document owner if you need access.</p>
		{:else}
			<h1 class="err-h">Something went wrong</h1>
			<p class="err-p">{page.error?.message ?? 'An unexpected error occurred.'}</p>
		{/if}

		<a href="/" class="err-btn">Back to documents</a>
	</section>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	.app-bar {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-shrink: 0;
		height: 64px;
		padding: 0 16px;
	}

	.err {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 0;
		overflow: hidden;
		padding: 48px 24px;
		text-align: center;
	}

	.err-ico {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 72px;
		height: 72px;
		border-radius: var(--radius-pill);
		background: var(--brand-soft);
		color: var(--brand);
		margin-bottom: 20px;
	}

	.err-h {
		margin: 0 0 8px;
		font-size: 20px;
		font-weight: 500;
		color: var(--text);
	}

	.err-p {
		margin: 0 0 24px;
		max-width: none;
		font-size: 14px;
		color: var(--text-muted);
	}

	.err-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		padding: 0 18px;
		border-radius: var(--radius-pill);
		background: var(--brand);
		color: #fff;
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		transition: background var(--motion-ui);
	}

	.err-btn:hover {
		background: var(--color-primary-hover);
		color: #fff;
	}
</style>
