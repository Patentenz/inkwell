import { getSupabase } from '#lib/server/db/supabase.ts';

export async function upsertShare(
	documentId: string,
	targetUserId: string,
	role: 'viewer' | 'editor'
): Promise<void> {
	const supabase = getSupabase();
	const { error: dbError } = await supabase.from('document_shares').upsert(
		{
			document_id: documentId,
			user_id: targetUserId,
			role
		},
		{ onConflict: 'document_id,user_id' }
	);

	if (dbError) {
		throw new Error(dbError.message);
	}
}

export async function patchShareRole(
	documentId: string,
	targetUserId: string,
	role: 'viewer' | 'editor'
): Promise<void> {
	const supabase = getSupabase();
	const { error: dbError } = await supabase
		.from('document_shares')
		.update({ role })
		.eq('document_id', documentId)
		.eq('user_id', targetUserId);

	if (dbError) {
		throw new Error(dbError.message);
	}
}

export async function deleteShare(documentId: string, targetUserId: string): Promise<void> {
	const supabase = getSupabase();
	const { error: dbError } = await supabase
		.from('document_shares')
		.delete()
		.eq('document_id', documentId)
		.eq('user_id', targetUserId);

	if (dbError) {
		throw new Error(dbError.message);
	}
}
