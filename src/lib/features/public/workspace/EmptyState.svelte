<script lang="ts">
	import { enhance } from '$app/forms';
	import FileText from '@lucide/svelte/icons/file-text';
	import Plus from '@lucide/svelte/icons/plus';
	import ImportFileControl from '#lib/features/public/import/ImportFileControl.svelte';
	import UserMenu from '#lib/components/shared/UserMenu.svelte';
	import type { User } from '#lib/types/user.ts';

	interface Props {
		users: User[];
		user: User;
	}

	let { users, user }: Props = $props();
</script>

<div class="shell">
	<header class="app-bar">
		<UserMenu {users} current={user} />
	</header>

	<section class="home">
		<div class="home-ico" aria-hidden="true">
			<FileText size={32} />
		</div>
		<h1 class="home-h">No document open</h1>
		<p class="home-p">Pick a document from the sidebar or start a new one.</p>
		<div class="home-actions">
			<form method="POST" action="/?/create" use:enhance class="home-create-f">
				<button type="submit" class="home-btn">
					<Plus size={18} />
					New document
				</button>
			</form>
			<ImportFileControl variant="home" />
		</div>
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

	.home {
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

	.home-ico {
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

	.home-h {
		margin: 0 0 8px;
		font-size: 20px;
		font-weight: 500;
		color: var(--text);
	}

	.home-p {
		margin: 0 0 24px;
		max-width: none;
		font-size: 14px;
		color: var(--text-muted);
	}

	.home-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.home-create-f {
		display: inline-flex;
	}

	.home-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 40px;
		padding: 0 18px;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--brand);
		color: #fff;
		font-size: 14px;
		font-weight: 500;
		transition: background var(--motion-ui);
	}

	.home-btn:hover {
		background: var(--brand-hover);
	}
</style>
