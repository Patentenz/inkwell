import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createDocument } from '#lib/server/services/documents.ts';
import {
	deriveTitle,
	markdownToDoc,
	textToDoc
} from '#lib/server/services/import/markdown-to-doc.ts';
import { validateImportFile } from '#lib/server/services/import/import-validation.ts';
import { validateDocumentContent } from '#lib/server/services/validation.ts';

export const actions = {
	create: async ({ locals }) => {
		const document = await createDocument(locals.userId);
		redirect(303, `/docs/${document.id}`);
	},

	import: async ({ request, locals }) => {
		const formData = await request.formData();
		const entry = formData.get('file');

		if (!(entry instanceof File)) {
			return fail(400, { message: 'No file selected.' });
		}

		const text = await entry.text();
		const checked = validateImportFile({
			name: entry.name,
			size: entry.size,
			type: entry.type,
			text
		});

		if (!checked.ok) {
			return fail(checked.status, { message: checked.message });
		}

		const content = checked.extension === '.txt' ? textToDoc(text) : markdownToDoc(text);
		const byteLength = new TextEncoder().encode(JSON.stringify(content)).byteLength;
		const contentValidation = validateDocumentContent(content, byteLength);

		if (!contentValidation.valid) {
			return fail(400, { message: 'Could not import this file.' });
		}

		const title = deriveTitle(entry.name, checked.extension === '.txt' ? undefined : text);
		const document = await createDocument(locals.userId, { title, content });
		redirect(303, `/docs/${document.id}`);
	}
} satisfies Actions;
