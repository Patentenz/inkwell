import type { JSONContent } from '@tiptap/core';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'failed';

const DEBOUNCE_MS = 1500;

interface AutosaveOptions {
	onSaved?: () => void;
}

export function createContentAutosave(getDocumentId: () => string, options: AutosaveOptions = {}) {
	let status = $state<SaveStatus>('saved');
	let latestSeq = 0;
	let debounceId: ReturnType<typeof setTimeout> | undefined;
	let pendingContent: JSONContent | null = null;

	function hasPendingChanges(): boolean {
		return (
			status === 'unsaved' || status === 'saving' || status === 'failed' || debounceId !== undefined
		);
	}

	async function performSave(content: JSONContent, seq: number): Promise<void> {
		status = 'saving';
		const documentId = getDocumentId();

		try {
			const response = await fetch(`/api/documents/${documentId}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ content })
			});

			if (seq !== latestSeq) {
				return;
			}

			if (!response.ok) {
				status = 'failed';
				return;
			}

			status = 'saved';
			pendingContent = null;
			options.onSaved?.();
		} catch {
			if (seq !== latestSeq) {
				return;
			}
			status = 'failed';
		}
	}

	function queue(content: JSONContent): void {
		pendingContent = content;
		status = 'unsaved';
		latestSeq += 1;
		const seq = latestSeq;

		if (debounceId !== undefined) {
			clearTimeout(debounceId);
		}

		debounceId = setTimeout(() => {
			debounceId = undefined;
			void performSave(content, seq);
		}, DEBOUNCE_MS);
	}

	function flushForNavigation(): void {
		if (debounceId !== undefined) {
			clearTimeout(debounceId);
			debounceId = undefined;
		}

		if (!pendingContent) {
			return;
		}

		latestSeq += 1;
		const seq = latestSeq;
		const content = pendingContent;
		void performSave(content, seq);
	}

	async function saveNow(): Promise<void> {
		if (debounceId !== undefined) {
			clearTimeout(debounceId);
			debounceId = undefined;
		}

		if (!pendingContent) {
			return;
		}

		latestSeq += 1;
		const seq = latestSeq;
		const content = pendingContent;
		await performSave(content, seq);
	}

	function retry(): void {
		if (!pendingContent) {
			return;
		}

		latestSeq += 1;
		void performSave(pendingContent, latestSeq);
	}

	function reset(): void {
		if (debounceId !== undefined) {
			clearTimeout(debounceId);
			debounceId = undefined;
		}
		latestSeq = 0;
		pendingContent = null;
		status = 'saved';
	}

	return {
		get status() {
			return status;
		},
		queue,
		saveNow,
		flushForNavigation,
		retry,
		reset,
		hasPendingChanges
	};
}
