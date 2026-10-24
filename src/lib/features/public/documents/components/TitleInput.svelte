<script lang="ts">
	interface Props {
		canEdit: boolean;
		titleDraft: string;
		onkeydown: (event: KeyboardEvent) => void;
		onfocus: (event: FocusEvent) => void;
		onblur: () => void;
	}

	let { canEdit, titleDraft = $bindable(), onkeydown, onfocus, onblur }: Props = $props();
</script>

<input
	class="hd-title"
	class:hd-title-ro={!canEdit}
	type="text"
	bind:value={titleDraft}
	readonly={!canEdit}
	maxlength="200"
	aria-label="Document title"
	{onkeydown}
	{onfocus}
	{onblur}
/>

<style>
	.hd-title {
		field-sizing: content;
		min-width: 120px;
		max-width: 480px;
		font-size: 18px;
		font-weight: 400;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		padding: 2px 6px;
		transition:
			border-color var(--motion-ui),
			outline-color var(--motion-ui);
	}

	.hd-title:not(.hd-title-ro):hover {
		border-color: var(--border);
	}

	.hd-title:not(.hd-title-ro):focus-visible {
		border-color: transparent;
		outline: 2px solid var(--brand);
		outline-offset: 0;
	}

	.hd-title-ro {
		cursor: default;
	}

	@media screen and (max-width: 37.5rem) {
		.hd-title {
			max-width: 60vw;
		}
	}
</style>
