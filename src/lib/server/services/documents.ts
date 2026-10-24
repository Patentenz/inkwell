import { error } from '@sveltejs/kit';
import type {
	DocumentRecord,
	DocumentSummary,
	SharedDocumentSummary
} from '#lib/types/document.ts';
import type { Access, ShareCollaborator } from '#lib/types/share.ts';
import {
	canEditDocument,
	loadDocumentAccessContext,
	resolveAccess
} from '#lib/server/services/access.ts';
import { getSupabase } from '#lib/server/db/supabase.ts';

function assertTitle(raw: FormDataEntryValue | null): string {
	if (typeof raw !== 'string') {
		error(400, 'Invalid title');
	}

	const title = raw.trim();

	if (title.length < 1 || title.length > 200) {
		error(400, 'Invalid title');
	}

	return title;
}

export function parseTitle(raw: FormDataEntryValue | null): string {
	return assertTitle(raw);
}

function one<T>(value: T | T[] | null | undefined): T | null {
	if (value == null) {
		return null;
	}
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

interface DocumentViewRow {
	id: string;
	title: string;
	content: unknown;
	owner_id: string;
	created_at: string;
	updated_at: string;
	owner:
		| { id: string; name: string; email: string }
		| { id: string; name: string; email: string }[]
		| null;
	document_shares: Array<{
		user_id: string;
		role: 'viewer' | 'editor';
		created_at: string;
		user:
			| { id: string; name: string; email: string }
			| { id: string; name: string; email: string }[]
			| null;
	}> | null;
}

export async function getDocumentView(
	documentId: string,
	userId: string
): Promise<{
	document: DocumentRecord;
	access: Access;
	owner: { id: string; name: string; email: string };
	shares: ShareCollaborator[];
}> {
	const supabase = getSupabase();
	const { data, error: dbError } = await supabase
		.from('documents')
		.select(
			`
			id, title, content, owner_id, created_at, updated_at,
			owner:users!documents_owner_id_fkey ( id, name, email ),
			document_shares (
				user_id, role, created_at,
				user:users!document_shares_user_id_fkey ( id, name, email )
			)
		`
		)
		.eq('id', documentId)
		.maybeSingle();

	if (dbError) {
		throw new Error(dbError.message);
	}

	if (!data) {
		error(404, 'Document not found');
	}

	const row = data as DocumentViewRow;
	const ownerUser = one(row.owner);
	if (!ownerUser) {
		error(404, 'Document not found');
	}

	const shareRows = row.document_shares ?? [];
	const sharesForAccess = shareRows.map((entry) => ({
		document_id: documentId,
		user_id: entry.user_id,
		role: entry.role
	}));

	const access = resolveAccess(row.owner_id, sharesForAccess, userId);
	if (!access) {
		error(404, 'Document not found');
	}

	const document: DocumentRecord = {
		id: row.id,
		title: row.title,
		owner_id: row.owner_id,
		content: row.content,
		created_at: row.created_at,
		updated_at: row.updated_at
	};

	const owner = { id: ownerUser.id, name: ownerUser.name, email: ownerUser.email };

	let shares: ShareCollaborator[] = [];
	if (access === 'owner') {
		const collaborators: ShareCollaborator[] = [];
		for (const entry of shareRows) {
			const user = one(entry.user);
			if (!user) {
				continue;
			}
			collaborators.push({
				userId: user.id,
				name: user.name,
				email: user.email,
				role: entry.role
			});
		}
		collaborators.sort((a, b) => a.name.localeCompare(b.name));
		shares = collaborators;
	}

	return { document, access, owner, shares };
}

export async function listOwned(userId: string): Promise<DocumentSummary[]> {
	const supabase = getSupabase();
	const { data, error: dbError } = await supabase
		.from('documents')
		.select('id, title, owner_id, updated_at')
		.eq('owner_id', userId)
		.order('updated_at', { ascending: false });

	if (dbError) {
		throw new Error(dbError.message);
	}

	return data ?? [];
}

interface SharedDocumentRow {
	role: 'viewer' | 'editor';
	documents: {
		id: string;
		title: string;
		owner_id: string;
		updated_at: string;
		owner: { name: string } | { name: string }[] | null;
	} | null;
}

export async function listShared(userId: string): Promise<SharedDocumentSummary[]> {
	const supabase = getSupabase();
	const { data, error: dbError } = await supabase
		.from('document_shares')
		.select(
			`
			role,
			documents!inner (
				id,
				title,
				owner_id,
				updated_at,
				owner:users!documents_owner_id_fkey (
					name
				)
			)
		`
		)
		.eq('user_id', userId);

	if (dbError) {
		throw new Error(dbError.message);
	}

	const rows = (data ?? []) as unknown as SharedDocumentRow[];
	const summaries: SharedDocumentSummary[] = [];

	for (const row of rows) {
		const docRaw = row.documents;
		const doc = docRaw && Array.isArray(docRaw) ? docRaw[0] : docRaw;
		if (!doc) {
			continue;
		}

		const owner = doc.owner;
		const ownerName =
			owner && !Array.isArray(owner)
				? owner.name
				: Array.isArray(owner)
					? owner[0]?.name
					: 'Unknown';

		summaries.push({
			id: doc.id,
			title: doc.title,
			owner_id: doc.owner_id,
			updated_at: doc.updated_at,
			owner_name: ownerName ?? 'Unknown',
			role: row.role
		});
	}

	summaries.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
	return summaries;
}

export async function createDocument(
	userId: string,
	initial?: { title: string; content: unknown }
): Promise<DocumentRecord> {
	const supabase = getSupabase();
	const row: { owner_id: string; title?: string; content?: unknown } = { owner_id: userId };
	if (initial) {
		row.title = initial.title;
		row.content = initial.content;
	}
	const { data, error: dbError } = await supabase
		.from('documents')
		.insert(row)
		.select('id, title, owner_id, content, created_at, updated_at')
		.single();

	if (dbError || !data) {
		throw new Error(dbError?.message ?? 'Failed to create document');
	}

	return data;
}

export async function renameDocument(
	documentId: string,
	userId: string,
	titleInput: FormDataEntryValue | null
): Promise<DocumentRecord> {
	const { access } = await loadDocumentAccessContext(documentId, userId);

	if (!canEditDocument(access)) {
		error(403, 'Forbidden');
	}

	const title = assertTitle(titleInput);
	const supabase = getSupabase();

	const { data, error: dbError } = await supabase
		.from('documents')
		.update({ title })
		.eq('id', documentId)
		.select('id, title, owner_id, content, created_at, updated_at')
		.single();

	if (dbError || !data) {
		throw new Error(dbError?.message ?? 'Failed to rename document');
	}

	return data;
}

export async function updateContent(
	documentId: string,
	userId: string,
	content: unknown
): Promise<{ updatedAt: string }> {
	const { access } = await loadDocumentAccessContext(documentId, userId);

	if (!canEditDocument(access)) {
		error(403, 'Forbidden');
	}

	const supabase = getSupabase();
	const { data, error: dbError } = await supabase
		.from('documents')
		.update({ content })
		.eq('id', documentId)
		.select('updated_at')
		.single();

	if (dbError || !data) {
		throw new Error(dbError?.message ?? 'Failed to update content');
	}

	return { updatedAt: data.updated_at };
}

export async function deleteDocument(documentId: string, userId: string): Promise<void> {
	const { access } = await loadDocumentAccessContext(documentId, userId);

	if (access !== 'owner') {
		error(403, 'Forbidden');
	}

	const supabase = getSupabase();
	const { error: dbError } = await supabase.from('documents').delete().eq('id', documentId);

	if (dbError) {
		throw new Error(dbError.message);
	}
}
