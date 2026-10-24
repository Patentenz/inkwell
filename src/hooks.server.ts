import type { Handle } from '@sveltejs/kit/hooks';
import { resolveUserId } from '#lib/server/auth/current-user.ts';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.userId = await resolveUserId(event.cookies);
	return resolve(event);
};
