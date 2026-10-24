import type { User } from '#lib/types/user.ts';

const AVATAR_COLORS: Record<string, string> = {
	'11111111-1111-1111-1111-111111111111': '#2d3a8c',
	'22222222-2222-2222-2222-222222222222': '#2f7d6b',
	'33333333-3333-3333-3333-333333333333': '#b5562d'
};

export function userInitials(name: string): string {
	return name
		.split(/\s+/)
		.map((part) => part[0] ?? '')
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

export function userAvatarColor(user: Pick<User, 'id'>): string {
	return AVATAR_COLORS[user.id] ?? '#2d3a8c';
}
