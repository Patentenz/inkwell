export const MAX_IMPORT_FILE_BYTES = 1024 * 1024;

const ALLOWED_EXTENSIONS = ['.md', '.markdown', '.txt'] as const;

const ALLOWED_MIME_TYPES = new Set(['text/plain', 'text/markdown', 'text/x-markdown', '']);

export type ImportValidationResult =
	| { ok: true; extension: (typeof ALLOWED_EXTENSIONS)[number] }
	| { ok: false; status: 400 | 413 | 415; message: string };

export function extensionFromFileName(name: string): (typeof ALLOWED_EXTENSIONS)[number] | null {
	const lower = name.toLowerCase();
	for (const ext of ALLOWED_EXTENSIONS) {
		if (lower.endsWith(ext)) {
			return ext;
		}
	}
	return null;
}

export function validateImportFile(input: {
	name: string;
	size: number;
	type: string;
	text: string;
}): ImportValidationResult {
	const extension = extensionFromFileName(input.name);
	if (!extension) {
		return { ok: false, status: 415, message: 'Only .md and .txt files are supported.' };
	}

	const mime = input.type.trim().toLowerCase();
	if (!ALLOWED_MIME_TYPES.has(mime)) {
		return { ok: false, status: 415, message: 'Only .md and .txt files are supported.' };
	}

	if (input.size > MAX_IMPORT_FILE_BYTES) {
		return { ok: false, status: 413, message: 'File is larger than 1 MB.' };
	}

	if (input.text.trim().length === 0) {
		return { ok: false, status: 400, message: 'File is empty.' };
	}

	if (input.text.includes('\0')) {
		return { ok: false, status: 415, message: "File doesn't look like text." };
	}

	return { ok: true, extension };
}
