import { invalidate } from '$app/navigation';
import { SIDEBAR_DEPENDS } from '#lib/constants/sidebar.ts';

export async function commitDocumentTitle(
	draft: string,
	storedTitle: string,
	setTitleDraft: (value: string) => void
): Promise<void> {
	const trimmed = draft.trim();
	if (!trimmed) {
		setTitleDraft(storedTitle);
		return;
	}
	if (trimmed === storedTitle) {
		return;
	}

	const body = new FormData();
	body.set('title', trimmed);

	await fetch('?/rename', {
		method: 'POST',
		body,
		headers: { 'x-sveltekit-action': 'true' }
	});

	await invalidate(SIDEBAR_DEPENDS);
}

export function handleDocumentTitleKeydown(
	event: KeyboardEvent,
	storedTitle: string,
	setTitleDraft: (value: string) => void
): void {
	if (event.key === 'Enter') {
		event.preventDefault();
		if (event.currentTarget instanceof HTMLInputElement) {
			event.currentTarget.blur();
		}
	}
	if (event.key === 'Escape') {
		setTitleDraft(storedTitle);
		if (event.currentTarget instanceof HTMLInputElement) {
			event.currentTarget.blur();
		}
	}
}

export function handleDocumentTitleFocus(
	event: FocusEvent,
	options: {
		canEdit: boolean;
		storedTitle: string;
		titleFocusedOnce: boolean;
		setTitleFocusedOnce: (value: boolean) => void;
	}
): void {
	const input = event.currentTarget;
	if (!(input instanceof HTMLInputElement) || !options.canEdit) {
		return;
	}
	if (options.titleFocusedOnce || options.storedTitle !== 'Untitled document') {
		return;
	}
	options.setTitleFocusedOnce(true);
	input.select();
}
