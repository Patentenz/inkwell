import { describe, expect, it } from 'vitest';
import { validateShare } from '#lib/server/services/share-rules.ts';

const ownerId = '11111111-1111-1111-1111-111111111111';
const bobId = '22222222-2222-2222-2222-222222222222';

describe('validateShare', () => {
	it('allows owner to share with a valid role', () => {
		expect(
			validateShare({
				actorAccess: 'owner',
				ownerId,
				targetUserId: bobId,
				role: 'editor'
			})
		).toEqual({ ok: true });
	});

	it('rejects editor actor with 403', () => {
		expect(
			validateShare({
				actorAccess: 'editor',
				ownerId,
				targetUserId: bobId,
				role: 'viewer'
			})
		).toEqual({ ok: false, status: 403, message: 'Only the owner can manage sharing' });
	});

	it('rejects viewer actor with 403', () => {
		expect(
			validateShare({
				actorAccess: 'viewer',
				ownerId,
				targetUserId: bobId,
				role: 'viewer'
			})
		).toEqual({ ok: false, status: 403, message: 'Only the owner can manage sharing' });
	});

	it('rejects sharing with self with 400', () => {
		expect(
			validateShare({
				actorAccess: 'owner',
				ownerId,
				targetUserId: ownerId,
				role: 'editor'
			})
		).toEqual({ ok: false, status: 400, message: 'Cannot share with the document owner' });
	});

	it('rejects invalid role with 400', () => {
		expect(
			validateShare({
				actorAccess: 'owner',
				ownerId,
				targetUserId: bobId,
				role: 'admin'
			})
		).toEqual({ ok: false, status: 400, message: 'Invalid role' });
	});
});
