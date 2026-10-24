<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { SIDEBAR_DEPENDS } from '#lib/constants/sidebar.ts';
	import X from '@lucide/svelte/icons/x';
	import type { ShareCollaborator } from '#lib/types/share.ts';
	import type { User } from '#lib/types/user.ts';
	import Bezel from '#lib/components/ui/Bezel.svelte';
	import { userAvatarColor, userInitials } from '#lib/components/shared/user-avatar.ts';
	import { toast, toastMessageForAction } from '#lib/components/ui/toast.svelte.ts';

	interface Props {
		open: boolean;
		documentTitle: string;
		documentId: string;
		owner: { id: string; name: string; email: string };
		shares: ShareCollaborator[];
		users: User[];
		currentUserId: string;
		onclose: () => void;
	}

	let { open, documentTitle, documentId, owner, shares, users, currentUserId, onclose }: Props =
		$props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let addUserId = $state('');
	let addRole = $state<'viewer' | 'editor'>('editor');
	let inlineError = $state('');
	let addUserSelect = $state<HTMLSelectElement | null>(null);

	const sharedIds = $derived(new Set(shares.map((entry) => entry.userId)));

	const addableUsers = $derived(
		users.filter((user) => user.id !== owner.id && !sharedIds.has(user.id))
	);

	const addDisabled = $derived(addableUsers.length === 0);

	const demoUserLabel = $derived(users.map((user) => user.name).join(', '));

	$effect(() => {
		const node = dialogEl;
		if (!node) {
			return;
		}
		if (open && !node.open) {
			inlineError = '';
			addRole = 'editor';
			addUserId = addableUsers[0]?.id ?? '';
			node.showModal();
			queueMicrotask(() => {
				if (addUserSelect && !addDisabled) {
					addUserSelect.focus();
				}
			});
		}
		if (!open && node.open) {
			node.close();
		}
	});

	$effect(() => {
		if (!addDisabled && addUserId && !addableUsers.some((user) => user.id === addUserId)) {
			addUserId = addableUsers[0]?.id ?? '';
		}
	});

	function onDialogClose(): void {
		onclose();
	}

	function onDialogClick(event: MouseEvent): void {
		if (event.target === dialogEl) {
			dialogEl?.close();
		}
	}

	function handleActionResult(result: {
		type: string;
		data?: { message?: string; toast?: string; userName?: string };
	}): boolean {
		if (result.type === 'failure') {
			inlineError = result.data?.message ?? 'Something went wrong';
			return false;
		}
		if (result.type === 'success' && result.data?.toast && result.data.userName) {
			const message = toastMessageForAction(result.data.toast, result.data.userName);
			if (message) {
				toast.show(message);
			}
			inlineError = '';
			return true;
		}
		return true;
	}
</script>

<dialog
	bind:this={dialogEl}
	class="ink-dlg sh-dlg"
	aria-labelledby="share-title"
	onclose={onDialogClose}
	onclick={onDialogClick}
>
	<div class="ink-dlg-shell">
		<Bezel size="lg">
			{#snippet header()}
				<div class="sh-hd">
					<h2 id="share-title" class="sh-title">
						Share <span class="sh-doc-t">"{documentTitle}"</span>
					</h2>
					<button
						type="button"
						class="sh-close"
						aria-label="Close share dialog"
						onclick={() => dialogEl?.close()}
					>
						<X size={18} />
					</button>
				</div>
			{/snippet}

			<form
				method="POST"
				action="/docs/{documentId}?/share"
				class="sh-add"
				use:enhance={() => {
					return async ({ result, update }) => {
						const ok = handleActionResult(result);
						if (ok) {
							await invalidate(SIDEBAR_DEPENDS);
						}
						await update();
					};
				}}
			>
				<label class="sr-only" for="share-user">Add person</label>
				<select
					id="share-user"
					name="userId"
					class="sh-field"
					bind:this={addUserSelect}
					bind:value={addUserId}
					disabled={addDisabled}
				>
					{#if addDisabled}
						<option value="">Everyone already has access</option>
					{:else}
						{#each addableUsers as user (user.id)}
							<option value={user.id}>{user.name}</option>
						{/each}
					{/if}
				</select>

				<label class="sr-only" for="share-role">Role</label>
				<select
					id="share-role"
					name="role"
					class="sh-field sh-role"
					bind:value={addRole}
					disabled={addDisabled}
				>
					<option value="viewer">Viewer</option>
					<option value="editor">Editor</option>
				</select>

				<button type="submit" class="sh-share-btn" disabled={addDisabled}>Share</button>
			</form>

			<p class="sh-label">People with access</p>

			<ul class="sh-list">
				<li class="sh-row">
					<span class="sh-av" style:background={userAvatarColor({ id: owner.id })}
						>{userInitials(owner.name)}</span
					>
					<span class="sh-meta">
						<span class="sh-name">{owner.name}{owner.id === currentUserId ? ' (you)' : ''}</span>
						<span class="sh-email">{owner.email}</span>
					</span>
					<span class="sh-owner">Owner</span>
				</li>

				{#each shares as share (share.userId)}
					<li class="sh-row">
						<span class="sh-av" style:background={userAvatarColor({ id: share.userId })}
							>{userInitials(share.name)}</span
						>
						<span class="sh-meta">
							<span class="sh-name">{share.name}</span>
							<span class="sh-email">{share.email}</span>
						</span>
						<div class="sh-row-act">
							<form
								method="POST"
								action="/docs/{documentId}?/updateRole"
								class="sh-role-f"
								use:enhance={() => {
									return async ({ result, update }) => {
										const ok = handleActionResult(result);
										if (ok) {
											await invalidate(SIDEBAR_DEPENDS);
										}
										await update({ reset: false });
									};
								}}
							>
								<input type="hidden" name="userId" value={share.userId} />
								<label class="sr-only" for="role-{share.userId}">Role for {share.name}</label>
								<select
									id="role-{share.userId}"
									name="role"
									class="sh-field sh-field-sm"
									value={share.role}
									onchange={(event) => {
										event.currentTarget.form?.requestSubmit();
									}}
								>
									<option value="viewer">Viewer</option>
									<option value="editor">Editor</option>
								</select>
							</form>
							<form
								method="POST"
								action="/docs/{documentId}?/revoke"
								use:enhance={() => {
									return async ({ result, update }) => {
										const ok = handleActionResult(result);
										if (ok) {
											await invalidate(SIDEBAR_DEPENDS);
										}
										await update();
									};
								}}
							>
								<input type="hidden" name="userId" value={share.userId} />
								<button type="submit" class="sh-x" aria-label="Remove access for {share.name}">
									<X size={18} />
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>

			{#if inlineError}
				<p class="sh-err" role="alert">{inlineError}</p>
			{/if}

			{#snippet footer()}
				<div class="sh-foot">
					<p class="sh-hint">Demo users: {demoUserLabel}</p>
					<button type="button" class="sh-done" onclick={() => dialogEl?.close()}>Done</button>
				</div>
			{/snippet}
		</Bezel>
	</div>
</dialog>

<style>
	.sh-dlg {
		width: min(520px, calc(100vw - 32px));
	}

	.sh-hd {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-width: 0;
	}

	.sh-title {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		min-width: 0;
	}

	.sh-doc-t {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: inline-block;
		max-width: min(280px, 50vw);
		vertical-align: bottom;
	}

	.sh-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--text-muted);
		flex-shrink: 0;
		transition: background var(--motion-ui);
	}

	.sh-close:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.sh-add {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-bottom: 20px;
	}

	.sh-field {
		height: 40px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--bezel-inner);
		font-size: 14px;
		color: var(--text);
		min-width: 0;
		flex: 1;
		transition:
			border-color var(--motion-ui),
			outline-color var(--motion-ui);
	}

	.sh-field:focus-visible {
		outline: 2px solid var(--brand);
		outline-offset: 0;
		border-color: transparent;
	}

	.sh-role {
		flex: 0 0 auto;
		width: 112px;
	}

	.sh-field-sm {
		flex: 0 0 auto;
		width: 100px;
		height: 36px;
		font-size: 13px;
	}

	.sh-share-btn {
		flex-shrink: 0;
		height: 40px;
		padding: 0 16px;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--brand);
		color: #fff;
		font-size: 14px;
		font-weight: 500;
		transition: background var(--motion-ui);
	}

	.sh-share-btn:hover:not(:disabled) {
		background: var(--brand-hover);
	}

	.sh-share-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.sh-label {
		margin: 0 0 8px;
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
	}

	.sh-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.sh-row {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 56px;
		min-width: 0;
		padding: 8px 0;
	}

	.sh-row + .sh-row {
		border-top: 1px solid var(--border);
	}

	.sh-av {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-pill);
		font-size: 14px;
		font-weight: 600;
		color: #fff;
		flex-shrink: 0;
	}

	.sh-meta {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sh-name {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sh-email {
		font-size: 13px;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sh-owner {
		font-size: 13px;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.sh-row-act {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.sh-role-f {
		display: flex;
	}

	.sh-x {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: var(--text-muted);
		transition: background var(--motion-ui);
	}

	.sh-x:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.sh-err {
		margin: 12px 0 0;
		font-size: 13px;
		color: var(--danger);
	}

	.sh-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.sh-hint {
		margin: 0;
		font-size: 12px;
		color: var(--text-muted);
	}

	.sh-done {
		height: 36px;
		padding: 0 18px;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--brand);
		color: #fff;
		font-size: 14px;
		font-weight: 500;
		transition: background var(--motion-ui);
	}

	.sh-done:hover {
		background: var(--brand-hover);
	}
</style>
