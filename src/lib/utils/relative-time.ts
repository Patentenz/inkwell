export function formatRelativeTime(iso: string, now: Date = new Date()): string {
	const then = new Date(iso);
	const diffMs = Math.max(0, now.getTime() - then.getTime());
	const diffMin = Math.floor(diffMs / 60_000);

	if (diffMin < 1) {
		return 'just now';
	}

	if (diffMin < 60) {
		return `${diffMin}m`;
	}

	const diffHours = Math.floor(diffMin / 60);
	if (diffHours < 24) {
		return `${diffHours}h`;
	}

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 7) {
		return `${diffDays}d`;
	}

	return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatEditedLabel(iso: string, now?: Date): string {
	const rel = formatRelativeTime(iso, now);
	if (rel === 'just now') {
		return 'Edited just now';
	}
	return `Edited ${rel} ago`;
}
