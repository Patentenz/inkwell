import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserById, setUserIdCookie } from '#lib/server/auth/current-user.ts';

export const actions = {
	switch: async ({ request, cookies }) => {
		const data = await request.formData();
		const userId = data.get('userId');

		if (typeof userId !== 'string' || !userId) {
			redirect(303, '/');
		}

		const user = await getUserById(userId);
		if (!user) {
			redirect(303, '/');
		}

		setUserIdCookie(cookies, user.id);
		redirect(303, '/');
	}
} satisfies Actions;
