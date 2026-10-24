class ToastController {
	message = $state<string | null>(null);
	private timer: ReturnType<typeof setTimeout> | undefined;

	show(text: string): void {
		this.message = text;
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(() => {
			this.message = null;
		}, 4000);
	}
}

export const toast = new ToastController();

export function toastMessageForAction(kind: string, userName: string): string {
	switch (kind) {
		case 'shared-editor':
			return `Shared with ${userName} as editor`;
		case 'shared-viewer':
			return `${userName} can now view`;
		case 'role-editor':
			return `Shared with ${userName} as editor`;
		case 'role-viewer':
			return `${userName} can now view`;
		case 'revoked':
			return `Removed ${userName}'s access`;
		default:
			return '';
	}
}
