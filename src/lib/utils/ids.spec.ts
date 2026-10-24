import { describe, expect, it } from 'vitest';
import { isId } from '#lib/utils/ids.ts';

describe('isId', () => {
	it('accepts demo and document seed ids', () => {
		expect(isId('11111111-1111-1111-1111-111111111111')).toBe(true);
		expect(isId('22222222-2222-2222-2222-222222222222')).toBe(true);
		expect(isId('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')).toBe(true);
	});

	it('accepts a standard v4 uuid shape', () => {
		expect(isId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
	});

	it('rejects invalid values', () => {
		expect(isId('')).toBe(false);
		expect(isId('abc')).toBe(false);
		expect(isId('12345678-1234-1234-1234-12345678901')).toBe(false);
		expect(isId('gggggggg-1111-1111-1111-111111111111')).toBe(false);
		expect(isId(null)).toBe(false);
	});
});
