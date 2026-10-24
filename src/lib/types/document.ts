export interface DocumentSummary {
	id: string;
	title: string;
	owner_id: string;
	updated_at: string;
}

export interface SharedDocumentSummary extends DocumentSummary {
	owner_name: string;
	role: 'viewer' | 'editor';
}

export interface DocumentRecord extends DocumentSummary {
	content: unknown;
	created_at: string;
}
