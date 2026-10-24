import { describe, expect, it } from 'vitest';
import { canEditDocument, resolveAccess } from '#lib/server/services/access.ts';
import type { Share } from '#lib/types/share.ts';

describe('resolveAccess', () => {
	const ownerId = '11111111-1111-1111-1111-111111111111';
	const shares: Share[] = [
		{
			document_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
			user_id: '22222222-2222-2222-2222-222222222222',
			role: 'editor'
		}
	];

	it('returns owner for the document owner', () => {
		expect(resolveAccess(ownerId, shares, ownerId)).toBe('owner');
	});

	it('returns share role for a shared user', () => {
		expect(resolveAccess(ownerId, shares, '22222222-2222-2222-2222-222222222222')).toBe('editor');
	});

	it('returns null when there is no access', () => {
		expect(resolveAccess(ownerId, shares, '33333333-3333-3333-3333-333333333333')).toBe(null);
	});
});

describe('canEditDocument', () => {
	it('allows owner and editor', () => {
		expect(canEditDocument('owner')).toBe(true);
		expect(canEditDocument('editor')).toBe(true);
	});

	it('denies viewer', () => {
		expect(canEditDocument('viewer')).toBe(false);
	});
});
