import { generateText } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';

export type DescriptionContent = string | JSONContent;

export function descriptionContent(value: DescriptionContent) {
  return typeof value === 'string' ? value.replace(/^• /gm, '- ') : value;
}

export function descriptionText(value: DescriptionContent) {
  return typeof value === 'string' ? value : generateText(value, descriptionExtensions());
}

export function descriptionExtensions() {
  return [
    StarterKit,
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    Underline,
    Placeholder.configure({ placeholder: 'Add a description…' }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Markdown.configure({ html: false, breaks: true, transformPastedText: true }),
  ];
}
