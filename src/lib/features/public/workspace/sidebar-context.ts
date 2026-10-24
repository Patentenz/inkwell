export const SIDEBAR_CONTEXT_KEY = Symbol('inkwell-sidebar');

export interface ActiveDocumentTitle {
	documentId: string;
	title: string;
}

export interface SidebarContext {
	openDrawer: () => void;
	closeDrawer: () => void;
	setActiveDocumentTitle: (value: ActiveDocumentTitle | null) => void;
}
