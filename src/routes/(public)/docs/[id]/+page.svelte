<script lang="ts">
	import DocumentView from '#lib/features/public/documents/DocumentView.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let documentTabTitle = $state('');
</script>

<svelte:head>
	<title>{documentTabTitle}</title>
</svelte:head>

<DocumentView {data} bind:documentTabTitle />
