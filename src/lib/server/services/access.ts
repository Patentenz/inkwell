import { error } from '@sveltejs/kit';
import type { Access, Share } from '#lib/types/share.ts';
import { getSupabase } from '#lib/server/db/supabase.ts';

export function resolveAccess(ownerId: string, shares: Share[], userId: string): Access | null {
	if (ownerId === userId) {
		return 'owner';
	}

	const share = shares.find((entry) => entry.user_id === userId);
	return share ? share.role : null;
}

export function canEditDocument(access: Access): boolean {
	return access === 'owner' || access === 'editor';
}

export interface DocumentAccessContext {
	ownerId: string;
	shares: Share[];
	access: Access;
}

interface AccessRow {
	owner_id: string;
	document_shares: Array<{
		document_id: string;
		user_id: string;
		role: 'viewer' | 'editor';
	}> | null;
}

export async function loadDocumentAccessContext(
	documentId: string,
	userId: string
): Promise<DocumentAccessContext> {
	const supabase = getSupabase();
	const { data, error: dbError } = await supabase
		.from('documents')
		.select('owner_id, document_shares(document_id, user_id, role)')
		.eq('id', documentId)
		.maybeSingle();

	if (dbError) {
		throw new Error(dbError.message);
	}

	if (!data) {
		error(404, 'Document not found');
	}

	const row = data as AccessRow;
	const shares: Share[] = (row.document_shares ?? []).map((entry) => ({
		document_id: entry.document_id,
		user_id: entry.user_id,
		role: entry.role
	}));

	const access = resolveAccess(row.owner_id, shares, userId);

	if (!access) {
		error(404, 'Document not found');
	}

	return { ownerId: row.owner_id, shares, access };
}

export async function getDocumentAccess(documentId: string, userId: string): Promise<Access> {
	const ctx = await loadDocumentAccessContext(documentId, userId);
	return ctx.access;
}
