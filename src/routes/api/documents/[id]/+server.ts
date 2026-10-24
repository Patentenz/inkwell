import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { updateContent } from '#lib/server/services/documents.ts';
import { validateDocumentContent } from '#lib/server/services/validation.ts';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const raw = await request.text();
	const byteLength = new TextEncoder().encode(raw).byteLength;

	let body: unknown;

	try {
		body = raw ? JSON.parse(raw) : null;
	} catch {
		error(400, 'Invalid JSON');
	}

	if (typeof body !== 'object' || body === null || !('content' in body)) {
		error(400, 'Invalid content');
	}

	const content = (body as { content: unknown }).content;
	const validation = validateDocumentContent(content, byteLength);

	if (!validation.valid) {
		if (validation.error === 'oversized') {
			error(413, 'Payload too large');
		}
		error(400, 'Invalid content');
	}

	const result = await updateContent(params.id, locals.userId, content);
	return Response.json(result);
};
