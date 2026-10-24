export type Access = 'owner' | 'editor' | 'viewer';

export interface Share {
	document_id: string;
	user_id: string;
	role: 'viewer' | 'editor';
}

export interface ShareCollaborator {
	userId: string;
	name: string;
	email: string;
	role: 'viewer' | 'editor';
}
