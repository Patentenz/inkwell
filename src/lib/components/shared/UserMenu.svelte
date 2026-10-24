<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Bezel from '#lib/components/ui/Bezel.svelte';
	import { toast } from '#lib/components/ui/toast.svelte.ts';
	import type { User } from '#lib/types/user.ts';
	import { userAvatarColor, userInitials } from '#lib/components/shared/user-avatar.ts';

	interface Props {
		users: User[];
		current: User;
	}

	let { users, current }: Props = $props();

	let open = $state(false);
	let switching = $state(false);
	let activeIndex = $state(0);
	let rootEl = $state<HTMLDivElement | null>(null);
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let menuEl = $state<HTMLDivElement | null>(null);
	let itemEls = $state<(HTMLButtonElement | null)[]>([]);

	const currentIndex = $derived(users.findIndex((user) => user.id === current.id));
	const firstName = $derived(current.name.trim().split(/\s+/)[0] ?? current.name);
	const menuVisible = $derived(open || switching);

	$effect(() => {
		if (open) {
			activeIndex = currentIndex >= 0 ? currentIndex : 0;
		}
	});

	$effect(() => {
		if (!menuVisible) {
			return;
		}
		const index = activeIndex;
		queueMicrotask(() => {
			itemEls[index]?.focus();
		});
	});

	function toggleMenu(): void {
		if (switching) {
			return;
		}
		open = !open;
	}

	function closeMenu(focusTrigger = true): void {
		if (switching) {
			return;
		}
		open = false;
		if (focusTrigger) {
			triggerEl?.focus();
		}
	}

	function onDocumentClick(event: MouseEvent): void {
		const target = event.target as Node;
		if (!open || switching) {
			return;
		}
		if (rootEl?.contains(target)) {
			return;
		}
		closeMenu();
	}

	function onWindowKeydown(event: KeyboardEvent): void {
		if (!menuVisible) {
			return;
		}
		if (switching) {
			return;
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			closeMenu();
			return;
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = (activeIndex + 1) % users.length;
			return;
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = (activeIndex - 1 + users.length) % users.length;
			return;
		}
		if (event.key === 'Enter') {
			event.preventDefault();
			const user = users[activeIndex];
			if (!user) {
				return;
			}
			if (user.id === current.id) {
				closeMenu();
				return;
			}
			itemEls[activeIndex]?.click();
		}
	}

	$effect(() => {
		document.addEventListener('click', onDocumentClick);
		window.addEventListener('keydown', onWindowKeydown);
		return () => {
			document.removeEventListener('click', onDocumentClick);
			window.removeEventListener('keydown', onWindowKeydown);
		};
	});
</script>

<div class="um" bind:this={rootEl}>
	<button
		type="button"
		class="um-trig"
		bind:this={triggerEl}
		aria-haspopup="menu"
		aria-expanded={menuVisible}
		aria-label="Switch demo user (current: {current.name})"
		title="Switch demo user"
		onclick={toggleMenu}
		disabled={switching}
	>
		<span class="um-av" style:background={userAvatarColor(current)}
			>{userInitials(current.name)}</span
		>
		<span class="um-name">{firstName}</span>
		<span class="um-chv"><ChevronDown size={16} /></span>
	</button>

	<form
		method="POST"
		action="/session?/switch"
		class="um-switch-f"
		use:enhance={() => {
			switching = true;
			return async ({ result }) => {
				if (result.type === 'redirect') {
					// eslint-disable-next-line svelte/no-navigation-without-resolve
					await goto(result.location, { invalidateAll: true });
					switching = false;
					open = false;
					return;
				}
				switching = false;
				open = false;
				triggerEl?.focus();
				toast.show("Couldn't switch user");
				await applyAction(result);
			};
		}}
	>
		{#if menuVisible}
			<div
				class="um-pop"
				class:um-pop-busy={switching}
				bind:this={menuEl}
				role="menu"
				aria-label="Choose demo user"
				aria-busy={switching}
			>
				<Bezel size="sm">
					<div class="um-hd">
						<p class="um-hd-t">Demo users</p>
						<p class="um-hd-cap">Switch to test sharing and permissions</p>
						{#if switching}
							<p class="um-busy"><Loader2 size={14} class="um-spin" /> Switching…</p>
						{/if}
					</div>
					{#each users as user, index (user.id)}
						{#if user.id === current.id}
							<button
								type="button"
								class="mi um-item"
								class:um-item-a={index === activeIndex}
								role="menuitem"
								bind:this={itemEls[index]}
								disabled={switching}
								onclick={() => closeMenu()}
							>
								<span class="um-av" style:background={userAvatarColor(user)}
									>{userInitials(user.name)}</span
								>
								<span class="um-item-txt">
									<span class="um-item-name">{user.name}</span>
									<span class="um-item-email">{user.email}</span>
								</span>
								<span class="um-check"><Check size={18} /></span>
							</button>
						{:else}
							<button
								type="submit"
								name="userId"
								value={user.id}
								class="mi um-item"
								class:um-item-a={index === activeIndex}
								role="menuitem"
								bind:this={itemEls[index]}
								disabled={switching}
							>
								<span class="um-av" style:background={userAvatarColor(user)}
									>{userInitials(user.name)}</span
								>
								<span class="um-item-txt">
									<span class="um-item-name">{user.name}</span>
									<span class="um-item-email">{user.email}</span>
								</span>
							</button>
						{/if}
					{/each}
				</Bezel>
			</div>
		{/if}
	</form>
</div>

<style>
	.um {
		position: relative;
		flex-shrink: 0;
	}

	.um-switch-f {
		margin: 0;
		padding: 0;
		border: none;
	}

	.um-trig {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 36px;
		padding: 2px 10px 2px 2px;
		border: none;
		border-radius: 999px;
		background: transparent;
		cursor: pointer;
		transition: background var(--motion-ui);
	}

	.um-trig:hover:not(:disabled) {
		background: var(--bg-hover);
	}

	.um-trig:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.um-av {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-pill);
		font-size: 13px;
		font-weight: 600;
		color: #fff;
		flex-shrink: 0;
	}

	.um-name {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.um-chv {
		display: inline-flex;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.um-pop {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: 280px;
		z-index: var(--z-dropdown);
	}

	.um-pop-busy {
		pointer-events: none;
		opacity: 0.92;
	}

	.um-hd {
		padding: 10px 12px 8px;
		border-bottom: 1px solid var(--border);
	}

	.um-hd-t {
		margin: 0;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.um-hd-cap {
		margin: 4px 0 0;
		font-size: 12px;
		line-height: 1.35;
		color: var(--text-muted);
	}

	.um-busy {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 8px 0 0;
		font-size: 12px;
		color: var(--text-muted);
	}

	.um-pop :global(.um-spin) {
		animation: um-spin 0.8s linear infinite;
	}

	@keyframes um-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.um-item {
		height: 52px;
		padding-top: 0;
		padding-bottom: 0;
	}

	.um-item:hover:not(:disabled),
	.um-item-a:not(:disabled) {
		background: var(--bg-hover);
	}

	.um-item:disabled {
		cursor: wait;
	}

	.um-item-txt {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		text-align: left;
	}

	.um-item-name {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
	}

	.um-item-email {
		font-size: 12px;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.um-check {
		display: inline-flex;
		color: var(--brand);
		flex-shrink: 0;
	}
</style>
