<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- public URLs stay /docs/[id] */
	import FileText from '@lucide/svelte/icons/file-text';
	import Users from '@lucide/svelte/icons/users';
	import { formatEditedLabel } from '#lib/utils/relative-time.ts';
	import type { DocumentSummary, SharedDocumentSummary } from '#lib/types/document.ts';

	interface Props {
		ownedDocuments: DocumentSummary[];
		sharedDocuments: SharedDocumentSummary[];
		isActive: (id: string) => boolean;
		listTitle: (docId: string, storedTitle: string) => string;
		onNavigate: () => void;
	}

	let { ownedDocuments, sharedDocuments, isActive, listTitle, onNavigate }: Props = $props();
</script>

<nav class="sb-nav ink-scroll">
	<section class="sb-sec">
		<h2 class="sb-sec-t">My documents</h2>
		<ul class="sb-list">
			{#each ownedDocuments as doc (doc.id)}
				<li>
					<a
						href="/docs/{doc.id}"
						class="sb-item sb-item-own"
						class:sb-item-a={isActive(doc.id)}
						onclick={onNavigate}
					>
						<span class="sb-ico"><FileText size={18} /></span>
						<span class="sb-item-body">
							<span class="sb-item-t">{listTitle(doc.id, doc.title)}</span>
							<span class="sb-item-sub">{formatEditedLabel(doc.updated_at)}</span>
						</span>
					</a>
				</li>
			{:else}
				<li class="sb-empty">No documents yet</li>
			{/each}
		</ul>
	</section>

	<section class="sb-sec">
		<h2 class="sb-sec-t">Shared with me</h2>
		<ul class="sb-list">
			{#each sharedDocuments as doc (doc.id)}
				<li>
					<a
						href="/docs/{doc.id}"
						class="sb-item sb-item-sh"
						class:sb-item-a={isActive(doc.id)}
						onclick={onNavigate}
					>
						<span class="sb-ico"><Users size={18} /></span>
						<span class="sb-item-body">
							<span class="sb-item-t">{listTitle(doc.id, doc.title)}</span>
							<span class="sb-item-sub"
								>{doc.owner_name} · {doc.role === 'editor' ? 'Editor' : 'Viewer'}</span
							>
						</span>
					</a>
				</li>
			{:else}
				<li class="sb-empty">Nothing shared yet</li>
			{/each}
		</ul>
	</section>
</nav>

<style>
	.sb-nav {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding-bottom: 8px;
	}

	.sb-sec {
		margin-bottom: 12px;
	}

	.sb-sec-t {
		margin: 0 0 6px;
		padding: 0 20px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.sb-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.sb-item {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 36px;
		margin-right: 12px;
		padding: 0 12px 0 20px;
		border-radius: 0 var(--radius-pill) var(--radius-pill) 0;
		text-decoration: none;
		color: var(--text);
		font-size: 14px;
		transition: background var(--motion-ui);
	}

	.sb-item-own,
	.sb-item-sh {
		height: 48px;
		align-items: flex-start;
		padding-top: 6px;
		padding-bottom: 6px;
	}

	.sb-item:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.sb-item-a {
		background: var(--bg-selected);
		box-shadow: inset 3px 0 0 var(--brand);
	}

	.sb-item-a .sb-item-t {
		font-weight: 600;
	}

	.sb-ico {
		display: inline-flex;
		color: var(--brand);
		flex-shrink: 0;
	}

	.sb-item-body {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sb-item-t {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 500;
	}

	.sb-item-sub {
		font-size: 12px;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sb-empty {
		padding: 6px 20px;
		font-size: 13px;
		color: var(--text-subtle);
	}
</style>
