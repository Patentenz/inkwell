export const MAX_DOCUMENT_CONTENT_BYTES = 1024 * 1024;

export type ContentValidationError = 'invalid' | 'oversized';

export type ContentValidationResult =
	{ valid: true } | { valid: false; error: ContentValidationError };

export function validateDocumentContent(
	value: unknown,
	byteLength: number
): ContentValidationResult {
	if (byteLength > MAX_DOCUMENT_CONTENT_BYTES) {
		return { valid: false, error: 'oversized' };
	}

	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return { valid: false, error: 'invalid' };
	}

	const record = value as Record<string, unknown>;

	if (record.type !== 'doc') {
		return { valid: false, error: 'invalid' };
	}

	if (!Array.isArray(record.content)) {
		return { valid: false, error: 'invalid' };
	}

	return { valid: true };
}
