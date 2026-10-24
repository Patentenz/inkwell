import type { Access } from '#lib/types/share.ts';
import { isId } from '#lib/utils/ids.ts';

export interface ShareValidationInput {
	actorAccess: Access;
	ownerId: string;
	targetUserId: string;
	role: string;
}

export type ShareValidationResult =
	{ ok: true } | { ok: false; status: 400 | 403; message: string };

export function validateShare(input: ShareValidationInput): ShareValidationResult {
	if (input.actorAccess !== 'owner') {
		return { ok: false, status: 403, message: 'Only the owner can manage sharing' };
	}

	if (!isId(input.targetUserId)) {
		return { ok: false, status: 400, message: 'Invalid user' };
	}

	if (input.targetUserId === input.ownerId) {
		return { ok: false, status: 400, message: 'Cannot share with the document owner' };
	}

	if (input.role !== 'viewer' && input.role !== 'editor') {
		return { ok: false, status: 400, message: 'Invalid role' };
	}

	return { ok: true };
}
