import type { DocumentRecord } from '#lib/types/document.ts';
import type { Access, ShareCollaborator } from '#lib/types/share.ts';
import type { User } from '#lib/types/user.ts';

export interface DocumentViewData {
	document: DocumentRecord;
	access: Access;
	owner: Pick<User, 'id' | 'name' | 'email'>;
	shares: ShareCollaborator[];
	users: User[];
	user: User;
}
