import { describe, expect, it } from 'vitest';
import {
	MAX_DOCUMENT_CONTENT_BYTES,
	validateDocumentContent
} from '#lib/server/services/validation.ts';

describe('validateDocumentContent', () => {
	it('accepts a valid TipTap doc', () => {
		const content = { type: 'doc', content: [{ type: 'paragraph' }] };
		expect(validateDocumentContent(content, 48)).toEqual({ valid: true });
	});

	it('rejects wrong root type', () => {
		const content = { type: 'paragraph', content: [] };
		expect(validateDocumentContent(content, 32)).toEqual({ valid: false, error: 'invalid' });
	});

	it('rejects missing content array', () => {
		const content = { type: 'doc' };
		expect(validateDocumentContent(content, 16)).toEqual({ valid: false, error: 'invalid' });
	});

	it('rejects oversized payload', () => {
		const content = { type: 'doc', content: [] };
		expect(validateDocumentContent(content, MAX_DOCUMENT_CONTENT_BYTES + 1)).toEqual({
			valid: false,
			error: 'oversized'
		});
	});
});
