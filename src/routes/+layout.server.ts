import type { LayoutServerLoad } from './$types';
import { listUsers, setUserIdCookie } from '#lib/server/auth/current-user.ts';
import { listOwned, listShared } from '#lib/server/services/documents.ts';
import { SIDEBAR_DEPENDS } from '#lib/constants/sidebar.ts';

export const load: LayoutServerLoad = async ({ locals, depends, cookies }) => {
	depends(SIDEBAR_DEPENDS);

	const [users, ownedDocuments, sharedDocuments] = await Promise.all([
		listUsers(),
		listOwned(locals.userId),
		listShared(locals.userId)
	]);

	let user = users.find((entry) => entry.id === locals.userId);
	if (!user && users[0]) {
		user = users[0];
		setUserIdCookie(cookies, user.id);
	}

	if (!user) {
		throw new Error('No users found');
	}

	return {
		user,
		users,
		ownedDocuments,
		sharedDocuments
	};
};
