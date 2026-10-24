import { marked, type Token, type Tokens } from 'marked';

type Mark = { type: 'bold' | 'italic' };
type TextNode = { type: 'text'; text: string; marks?: Mark[] };
type HardBreakNode = { type: 'hardBreak' };
type InlineNode = TextNode | HardBreakNode;

type BlockNode = {
	type: string;
	content?: unknown[];
	attrs?: Record<string, unknown>;
};

export type TipTapDoc = { type: 'doc'; content: BlockNode[] };

const TITLE_FALLBACK = 'Imported document';
const MAX_TITLE_LENGTH = 200;

function textNode(text: string, marks?: Mark[]): TextNode | null {
	if (text.length === 0) {
		return null;
	}
	if (marks && marks.length > 0) {
		return { type: 'text', text, marks: [...marks] };
	}
	return { type: 'text', text };
}

function withMark(nodes: InlineNode[], mark: Mark): InlineNode[] {
	const marked: InlineNode[] = [];
	for (const node of nodes) {
		if (node.type === 'hardBreak') {
			marked.push(node);
			continue;
		}
		const existing = node.marks ?? [];
		marked.push({ type: 'text', text: node.text, marks: [...existing, mark] });
	}
	return marked;
}

function inlineFromTokens(tokens: Token[] | undefined, marks: Mark[] = []): InlineNode[] {
	if (!tokens || tokens.length === 0) {
		return [];
	}

	const nodes: InlineNode[] = [];

	for (const token of tokens) {
		switch (token.type) {
			case 'text': {
				const node = textNode(token.text, marks);
				if (node) {
					nodes.push(node);
				}
				break;
			}
			case 'escape': {
				const node = textNode(token.text, marks);
				if (node) {
					nodes.push(node);
				}
				break;
			}
			case 'br':
				nodes.push({ type: 'hardBreak' });
				break;
			case 'strong':
				nodes.push(...withMark(inlineFromTokens(token.tokens, marks), { type: 'bold' }));
				break;
			case 'em':
				nodes.push(...withMark(inlineFromTokens(token.tokens, marks), { type: 'italic' }));
				break;
			case 'del':
			case 'link': {
				const nested = token.tokens;
				if (nested && nested.length > 0) {
					nodes.push(...inlineFromTokens(nested, marks));
				} else {
					const plain = textNode(token.text, marks);
					if (plain) {
						nodes.push(plain);
					}
				}
				break;
			}
			case 'codespan': {
				const plain = textNode(token.text, marks);
				if (plain) {
					nodes.push(plain);
				}
				break;
			}
			default:
				break;
		}
	}

	return nodes;
}

function paragraphFromInline(inline: InlineNode[]): BlockNode | null {
	if (inline.length === 0) {
		return null;
	}
	return { type: 'paragraph', content: inline };
}

function paragraphFromTokens(token: Tokens.Paragraph): BlockNode | null {
	return paragraphFromInline(inlineFromTokens(token.tokens));
}

function headingFromToken(token: Tokens.Heading): BlockNode | null {
	const level = token.depth === 1 ? 1 : 2;
	const inline = inlineFromTokens(token.tokens);
	if (inline.length === 0) {
		return null;
	}
	return { type: 'heading', attrs: { level }, content: inline };
}

function plainTextParagraph(text: string): BlockNode | null {
	const trimmed = text.trim();
	if (trimmed.length === 0) {
		return null;
	}
	const node = textNode(trimmed);
	if (!node) {
		return null;
	}
	return { type: 'paragraph', content: [node] };
}

function tableToParagraphs(token: Tokens.Table): BlockNode[] {
	const rows: string[] = [];
	const header = token.header.map((cell) => cell.text.trim()).join(' | ');
	if (header.trim()) {
		rows.push(header);
	}
	for (const row of token.rows) {
		const line = row.map((cell) => cell.text.trim()).join(' | ');
		if (line.trim()) {
			rows.push(line);
		}
	}
	return rows
		.map((row) => plainTextParagraph(row))
		.filter((node): node is BlockNode => node !== null);
}

function listItemBlocks(tokens: Token[]): BlockNode[] {
	const blocks: BlockNode[] = [];
	let inlineChunk: Token[] = [];

	function flushInlineParagraph(): void {
		if (inlineChunk.length === 0) {
			return;
		}
		const paragraph = paragraphFromInline(inlineFromTokens(inlineChunk));
		inlineChunk = [];
		if (paragraph) {
			blocks.push(paragraph);
		}
	}

	for (const token of tokens) {
		if (token.type === 'text') {
			inlineChunk.push(token);
			continue;
		}
		if (token.type === 'paragraph') {
			flushInlineParagraph();
			const paragraph = paragraphFromTokens(token as Tokens.Paragraph);
			if (paragraph) {
				blocks.push(paragraph);
			}
			continue;
		}
		if (token.type === 'list') {
			flushInlineParagraph();
			blocks.push(listFromToken(token as Tokens.List));
			continue;
		}
		flushInlineParagraph();
	}

	flushInlineParagraph();
	return blocks;
}

function listItemFromToken(item: Tokens.ListItem): BlockNode | null {
	const blocks = listItemBlocks(item.tokens);
	if (blocks.length === 0) {
		return null;
	}
	return { type: 'listItem', content: blocks };
}

function listFromToken(token: Tokens.List): BlockNode {
	const listType = token.ordered ? 'orderedList' : 'bulletList';
	const items = token.items
		.map((item) => listItemFromToken(item))
		.filter((item): item is BlockNode => item !== null);
	return { type: listType, content: items };
}

function blockFromToken(token: Token): BlockNode[] {
	switch (token.type) {
		case 'heading': {
			const heading = headingFromToken(token as Tokens.Heading);
			return heading ? [heading] : [];
		}
		case 'paragraph': {
			const paragraph = paragraphFromTokens(token as Tokens.Paragraph);
			return paragraph ? [paragraph] : [];
		}
		case 'list':
			return [listFromToken(token as Tokens.List)];
		case 'hr':
			return [];
		case 'code': {
			const codeParagraph = plainTextParagraph(token.text);
			return codeParagraph ? [codeParagraph] : [];
		}
		case 'blockquote': {
			const parts: BlockNode[] = [];
			for (const inner of token.tokens ?? []) {
				parts.push(...blockFromToken(inner));
			}
			if (parts.length === 0) {
				const fallback = plainTextParagraph(token.text);
				return fallback ? [fallback] : [];
			}
			return parts;
		}
		case 'table':
			return tableToParagraphs(token as Tokens.Table);
		case 'html':
			return plainTextParagraph(token.text) ? [plainTextParagraph(token.text)!] : [];
		case 'space':
			return [];
		default:
			return [];
	}
}

export function markdownToDoc(markdown: string): TipTapDoc {
	const tokens = marked.lexer(markdown);
	const content: BlockNode[] = [];
	for (const token of tokens) {
		content.push(...blockFromToken(token));
	}
	if (content.length === 0) {
		return { type: 'doc', content: [] };
	}
	return { type: 'doc', content };
}

export function textToDoc(text: string): TipTapDoc {
	const blocks = text.split(/\n{2,}/);
	const content: BlockNode[] = [];

	for (const block of blocks) {
		const trimmedBlock = block.trim();
		if (trimmedBlock.length === 0) {
			continue;
		}
		const lines = trimmedBlock.split('\n');
		const inline: InlineNode[] = [];
		for (let i = 0; i < lines.length; i += 1) {
			const line = lines[i] ?? '';
			const node = textNode(line);
			if (node) {
				inline.push(node);
			}
			if (i < lines.length - 1) {
				inline.push({ type: 'hardBreak' });
			}
		}
		const paragraph = paragraphFromInline(inline);
		if (paragraph) {
			content.push(paragraph);
		}
	}

	if (content.length === 0) {
		return { type: 'doc', content: [] };
	}
	return { type: 'doc', content };
}

function plainTextFromInlineTokens(tokens: Token[] | undefined): string {
	if (!tokens) {
		return '';
	}
	let out = '';
	for (const token of tokens) {
		if (token.type === 'text' || token.type === 'escape') {
			out += token.text;
		} else if ('tokens' in token && Array.isArray(token.tokens)) {
			out += plainTextFromInlineTokens(token.tokens);
		} else if ('text' in token && typeof token.text === 'string') {
			out += token.text;
		}
	}
	return out;
}

function firstH1Text(markdown: string): string | null {
	const tokens = marked.lexer(markdown);
	for (const token of tokens) {
		if (token.type === 'heading' && token.depth === 1) {
			const text = plainTextFromInlineTokens(token.tokens).trim();
			if (text.length > 0) {
				return text;
			}
		}
	}
	return null;
}

function titleFromFileName(fileName: string): string {
	const base =
		fileName
			.replace(/[/\\]+$/, '')
			.split(/[/\\]/)
			.pop() ?? fileName;
	const withoutExt = base.replace(/\.(md|markdown|txt)$/i, '');
	const trimmed = withoutExt.trim();
	return trimmed.length > 0 ? trimmed : TITLE_FALLBACK;
}

function clampTitle(raw: string): string {
	const trimmed = raw.trim();
	if (trimmed.length === 0) {
		return TITLE_FALLBACK;
	}
	if (trimmed.length <= MAX_TITLE_LENGTH) {
		return trimmed;
	}
	return trimmed.slice(0, MAX_TITLE_LENGTH);
}

export function deriveTitle(fileName: string, markdown?: string): string {
	const fromHeading = markdown ? firstH1Text(markdown) : null;
	if (fromHeading) {
		return clampTitle(fromHeading);
	}
	return clampTitle(titleFromFileName(fileName));
}
