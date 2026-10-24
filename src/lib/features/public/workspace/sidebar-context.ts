export const SIDEBAR_CONTEXT_KEY = Symbol('inkwell-sidebar');

export interface SidebarContext {
	openDrawer: () => void;
	closeDrawer: () => void;
}
