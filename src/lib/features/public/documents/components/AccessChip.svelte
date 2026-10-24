<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import Lock from '@lucide/svelte/icons/lock';
	import Users from '@lucide/svelte/icons/users';

	interface AccessChipView {
		label: string;
		tone: 'neutral' | 'shared';
		icon: 'lock' | 'users' | 'eye';
	}

	interface Props {
		chip: AccessChipView;
	}

	let { chip }: Props = $props();
</script>

<div
	class="hd-access"
	class:hd-access-sh={chip.tone === 'shared'}
	class:hd-access-ro={chip.tone === 'neutral'}
>
	{#if chip.icon === 'lock'}
		<Lock size={14} />
	{:else if chip.icon === 'users'}
		<Users size={14} />
	{:else}
		<Eye size={14} />
	{/if}
	<span>{chip.label}</span>
</div>

<style>
	.hd-access {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: var(--radius-pill);
		font-size: 13px;
		color: var(--text-muted);
		white-space: nowrap;
		max-width: min(280px, 36vw);
	}

	.hd-access span {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.hd-access-ro {
		background: var(--bg-toolbar);
	}

	.hd-access-sh {
		background: var(--brand-soft);
		color: var(--text);
	}

	@media screen and (max-width: 37.5rem) {
		.hd-access {
			display: none;
		}
	}
</style>
