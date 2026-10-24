import { describe, expect, it } from 'vitest';
import { validateDocumentContent } from '#lib/server/services/validation.ts';
import {
	deriveTitle,
	markdownToDoc,
	textToDoc
} from '#lib/server/services/import/markdown-to-doc.ts';

function byteLength(value: unknown): number {
	return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

function expectValidDoc(content: unknown): void {
	const result = validateDocumentContent(content, byteLength(content));
	expect(result).toEqual({ valid: true });
}

describe('markdownToDoc', () => {
	it('maps H1 and H2 headings', () => {
		const doc = markdownToDoc('# Title one\n\n## Title two');
		expect(doc.content[0]).toEqual({
			type: 'heading',
			attrs: { level: 1 },
			content: [{ type: 'text', text: 'Title one' }]
		});
		expect(doc.content[1]).toEqual({
			type: 'heading',
			attrs: { level: 2 },
			content: [{ type: 'text', text: 'Title two' }]
		});
		expectValidDoc(doc);
	});

	it('maps ### to heading level 2', () => {
		const doc = markdownToDoc('### Deep');
		expect(doc.content[0]).toEqual({
			type: 'heading',
			attrs: { level: 2 },
			content: [{ type: 'text', text: 'Deep' }]
		});
	});

	it('maps bullet and ordered lists', () => {
		const doc = markdownToDoc('- one\n- two\n\n1. first\n2. second');
		expect(doc.content[0]).toEqual({
			type: 'bulletList',
			content: [
				{
					type: 'listItem',
					content: [{ type: 'paragraph', content: [{ type: 'text', text: 'one' }] }]
				},
				{
					type: 'listItem',
					content: [{ type: 'paragraph', content: [{ type: 'text', text: 'two' }] }]
				}
			]
		});
		expect(doc.content[1]).toEqual({
			type: 'orderedList',
			content: [
				{
					type: 'listItem',
					content: [{ type: 'paragraph', content: [{ type: 'text', text: 'first' }] }]
				},
				{
					type: 'listItem',
					content: [{ type: 'paragraph', content: [{ type: 'text', text: 'second' }] }]
				}
			]
		});
		expectValidDoc(doc);
	});

	it('maps bold and italic marks', () => {
		const doc = markdownToDoc('**bold** and *italic*');
		const paragraph = doc.content[0] as {
			content: { type: string; text: string; marks?: { type: string }[] }[];
		};
		expect(paragraph.content).toEqual([
			{ type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
			{ type: 'text', text: ' and ' },
			{ type: 'text', text: 'italic', marks: [{ type: 'italic' }] }
		]);
		expectValidDoc(doc);
	});
});

describe('deriveTitle', () => {
	it('uses first H1 when present', () => {
		expect(deriveTitle('notes.md', '# My Meeting\n\nBody')).toBe('My Meeting');
	});

	it('uses file name without extension when no H1', () => {
		expect(deriveTitle('quarterly-report.markdown', 'No heading')).toBe('quarterly-report');
	});
});

describe('textToDoc', () => {
	it('splits paragraphs and hard breaks', () => {
		const doc = textToDoc('Line one\nLine two\n\nSecond block');
		expect(doc.content[0]).toEqual({
			type: 'paragraph',
			content: [
				{ type: 'text', text: 'Line one' },
				{ type: 'hardBreak' },
				{ type: 'text', text: 'Line two' }
			]
		});
		expect(doc.content[1]).toEqual({
			type: 'paragraph',
			content: [{ type: 'text', text: 'Second block' }]
		});
		expectValidDoc(doc);
	});
});
