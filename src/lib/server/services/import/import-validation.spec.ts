import { describe, expect, it } from 'vitest';
import {
	MAX_IMPORT_FILE_BYTES,
	validateImportFile
} from '#lib/server/services/import/import-validation.ts';

describe('validateImportFile', () => {
	it('accepts allowed extensions and MIME types', () => {
		expect(
			validateImportFile({
				name: 'notes.md',
				size: 12,
				type: 'text/markdown',
				text: '# Hi'
			})
		).toEqual({ ok: true, extension: '.md' });

		expect(
			validateImportFile({
				name: 'README.MARKDOWN',
				size: 8,
				type: 'text/plain',
				text: 'Hello'
			})
		).toEqual({ ok: true, extension: '.markdown' });

		expect(
			validateImportFile({
				name: 'log.txt',
				size: 4,
				type: '',
				text: 'ok'
			})
		).toEqual({ ok: true, extension: '.txt' });
	});

	it('accepts empty MIME for .md files', () => {
		expect(
			validateImportFile({
				name: 'draft.md',
				size: 3,
				type: '',
				text: 'yes'
			})
		).toEqual({ ok: true, extension: '.md' });
	});

	it('rejects unsupported extensions and MIME types', () => {
		expect(
			validateImportFile({
				name: 'data.json',
				size: 4,
				type: 'application/json',
				text: '{}'
			})
		).toEqual({ ok: false, status: 415, message: 'Only .md and .txt files are supported.' });

		expect(
			validateImportFile({
				name: 'notes.md',
				size: 4,
				type: 'application/pdf',
				text: 'text'
			})
		).toEqual({ ok: false, status: 415, message: 'Only .md and .txt files are supported.' });
	});

	it('enforces the 1 MB limit', () => {
		expect(
			validateImportFile({
				name: 'big.txt',
				size: MAX_IMPORT_FILE_BYTES + 1,
				type: 'text/plain',
				text: 'x'
			})
		).toEqual({ ok: false, status: 413, message: 'File is larger than 1 MB.' });
	});

	it('rejects empty files', () => {
		expect(
			validateImportFile({
				name: 'empty.md',
				size: 0,
				type: 'text/markdown',
				text: '   \n\t'
			})
		).toEqual({ ok: false, status: 400, message: 'File is empty.' });
	});

	it('rejects NUL bytes', () => {
		expect(
			validateImportFile({
				name: 'bad.txt',
				size: 3,
				type: 'text/plain',
				text: 'a\u0000b'
			})
		).toEqual({ ok: false, status: 415, message: "File doesn't look like text." });
	});
});
