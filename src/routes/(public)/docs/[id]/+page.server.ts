import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { DOCUMENT_PAGE_DEPENDS } from '#lib/constants/document-page.ts';
import { deleteDocument, getDocumentView, renameDocument } from '#lib/server/services/documents.ts';
import { validateShare } from '#lib/server/services/share-rules.ts';
import { deleteShare, patchShareRole, upsertShare } from '#lib/server/services/shares.ts';
import { loadDocumentAccessContext } from '#lib/server/services/access.ts';
import { getSupabase } from '#lib/server/db/supabase.ts';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
	depends(DOCUMENT_PAGE_DEPENDS);
	return getDocumentView(params.id, locals.userId);
};

function parseRole(raw: FormDataEntryValue | null): 'viewer' | 'editor' | null {
	if (raw === 'viewer' || raw === 'editor') {
		return raw;
	}
	return null;
}

async function lookupUserName(userId: string): Promise<string> {
	const supabase = getSupabase();
	const { data } = await supabase.from('users').select('name').eq('id', userId).maybeSingle();
	return data?.name ?? 'User';
}

export const actions = {
	rename: async ({ request, params, locals }) => {
		const data = await request.formData();
		await renameDocument(params.id, locals.userId, data.get('title'));
	},

	delete: async ({ params, locals }) => {
		await deleteDocument(params.id, locals.userId);
		redirect(303, '/');
	},

	share: async ({ request, params, locals }) => {
		const form = await request.formData();
		const targetUserId = form.get('userId');
		const role = parseRole(form.get('role'));
		const ctx = await loadDocumentAccessContext(params.id, locals.userId);

		const validation = validateShare({
			actorAccess: ctx.access,
			ownerId: ctx.ownerId,
			targetUserId: typeof targetUserId === 'string' ? targetUserId : '',
			role: role ?? ''
		});

		if (!validation.ok) {
			return fail(validation.status, { message: validation.message });
		}

		if (!role || typeof targetUserId !== 'string') {
			return fail(400, { message: 'Invalid request' });
		}

		await upsertShare(params.id, targetUserId, role);
		const userName = await lookupUserName(targetUserId);

		return {
			ok: true,
			toast: role === 'editor' ? 'shared-editor' : 'shared-viewer',
			userName
		};
	},

	updateRole: async ({ request, params, locals }) => {
		const form = await request.formData();
		const targetUserId = form.get('userId');
		const role = parseRole(form.get('role'));
		const ctx = await loadDocumentAccessContext(params.id, locals.userId);

		const validation = validateShare({
			actorAccess: ctx.access,
			ownerId: ctx.ownerId,
			targetUserId: typeof targetUserId === 'string' ? targetUserId : '',
			role: role ?? ''
		});

		if (!validation.ok) {
			return fail(validation.status, { message: validation.message });
		}

		if (!role || typeof targetUserId !== 'string') {
			return fail(400, { message: 'Invalid request' });
		}

		await patchShareRole(params.id, targetUserId, role);
		const userName = await lookupUserName(targetUserId);

		return {
			ok: true,
			toast: role === 'editor' ? 'role-editor' : 'role-viewer',
			userName
		};
	},

	revoke: async ({ request, params, locals }) => {
		const form = await request.formData();
		const targetUserId = form.get('userId');

		if (typeof targetUserId !== 'string' || !targetUserId) {
			return fail(400, { message: 'Invalid user' });
		}

		const ctx = await loadDocumentAccessContext(params.id, locals.userId);
		if (ctx.access !== 'owner') {
			return fail(403, { message: 'Only the owner can manage sharing' });
		}

		const userName = await lookupUserName(targetUserId);
		await deleteShare(params.id, targetUserId);

		return {
			ok: true,
			toast: 'revoked',
			userName
		};
	}
} satisfies Actions;
