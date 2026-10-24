import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { createDocument } from '#lib/server/services/documents.ts';

export const actions = {
	create: async ({ locals }) => {
		const document = await createDocument(locals.userId);
		redirect(303, `/docs/${document.id}`);
	}
} satisfies Actions;
