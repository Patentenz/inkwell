<script lang="ts">
	import EmptyState from '#lib/features/public/workspace/EmptyState.svelte';
	import { APP_NAME } from '#lib/constants/app.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Documents · {APP_NAME}</title>
</svelte:head>

<EmptyState users={data.users} user={data.user} />
