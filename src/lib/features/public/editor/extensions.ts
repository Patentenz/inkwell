import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';

export const editorExtensions = [
	StarterKit.configure({
		heading: {
			levels: [1, 2]
		}
	}),
	Placeholder.configure({
		placeholder: 'Start typing…',
		emptyNodeClass: 'is-editor-empty',
		showOnlyCurrent: false
	})
];
