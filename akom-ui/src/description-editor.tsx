import { NativeSelect } from './components/ui/native-select';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import { Bold, Italic, Underline, Strikethrough, Code, Link2, List, ListOrdered, ListTodo, Quote, Check, X } from 'lucide-react';
import type { JSONContent } from '@tiptap/core';
import { descriptionContent, descriptionExtensions } from './description-content';
import type { DescriptionContent } from './description-content';
import './description-editor.css';

export function DescriptionEditor({ value, readOnly, onSave, draft = false, onSubmit }: {
  value: DescriptionContent;
  readOnly: boolean;
  draft?: boolean;
  onSubmit?: (content: JSONContent) => void;
  onSave: (content: JSONContent) => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const baseline = useRef<JSONContent | undefined>(undefined);
  const editing = useRef(false);
  const dirty = useRef(false);
  const [focused, setFocused] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkURL, setLinkURL] = useState('');
  const [linkError, setLinkError] = useState('');
  const editor = useEditor({
    extensions: descriptionExtensions(),
    content: descriptionContent(value),
    editable: !readOnly,
    editorProps: {
      attributes: { role: readOnly ? 'document' : 'textbox', 'aria-label': 'Issue description', 'aria-multiline': 'true', spellcheck: 'true' },
    },
    onFocus: ({ editor }) => {
      if (!editing.current) baseline.current = editor.getJSON();
      editing.current = true;
      setFocused(true);
    },
    onUpdate: ({ editor }) => { dirty.current = true; if (draft) onSave(editor.getJSON()); },
  });

  useEffect(() => {
    if (editor && !editing.current) editor.commands.setContent(descriptionContent(value), false);
  }, [editor, value]);

  const finish = (cancel = false) => {
    if (!editor || readOnly) return;
    if (cancel && baseline.current) { editor.commands.setContent(baseline.current, false); if (draft) onSave(baseline.current); }
    else if (dirty.current) onSave(editor.getJSON());
    dirty.current = false;
    editing.current = false;
    setFocused(false);
    setLinkOpen(false);
  };

  if (!editor) return null;
  return <div className={`issue-wysiwyg ${focused ? 'is-editing' : ''}`} ref={wrapper}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) finish(); }}
    onKeyDownCapture={event => {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); finish(true); editor.commands.blur();
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault(); event.stopPropagation();
        if (draft) onSubmit?.(editor.getJSON());
        else { finish(); editor.commands.blur(); }
      }
    }}>
    <EditorContent editor={editor} />
    {!readOnly && <BubbleMenu editor={editor} tippyOptions={{ duration: 100, maxWidth: 'none', appendTo: () => wrapper.current || document.body }}>
      <div className="description-bubble" onMouseDown={event => { if ((event.target as HTMLElement).closest('button')) event.preventDefault(); }}>
        <div className="description-formatting" role="toolbar" aria-label="Text formatting">
          <NativeSelect aria-label="Text style" value={editor.isActive('heading') ? editor.getAttributes('heading').level : 'paragraph'} onChange={event => {
            const level = Number(event.target.value) as 1 | 2 | 3;
            if (level) editor.chain().focus().setHeading({ level }).run();
            else editor.chain().focus().setParagraph().run();
          }}><option value="paragraph">Text</option><option value="1">Heading 1</option><option value="2">Heading 2</option><option value="3">Heading 3</option></NativeSelect>
          <span className="description-toolbar-divider" />
          <Button type="button" aria-label="Bold" title="Bold · ⌘/Ctrl+B" aria-pressed={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></Button>
          <Button type="button" aria-label="Italic" title="Italic · ⌘/Ctrl+I" aria-pressed={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></Button>
          <Button type="button" aria-label="Underline" title="Underline · ⌘/Ctrl+U" aria-pressed={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={14} /></Button>
          <Button type="button" aria-label="Strikethrough" title="Strikethrough" aria-pressed={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={14} /></Button>
          <Button type="button" aria-label="Edit link" title="Link" aria-pressed={editor.isActive('link')} onClick={() => { setLinkURL(editor.getAttributes('link').href || ''); setLinkError(''); setLinkOpen(open => !open); }}><Link2 size={14} /></Button>
          <Button type="button" aria-label="Quote" title="Quote" aria-pressed={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></Button>
          <Button type="button" aria-label="Inline code" title="Inline code" aria-pressed={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={14} /></Button>
          <span className="description-toolbar-divider" />
          <Button type="button" aria-label="Bullet list" title="Bullet list" aria-pressed={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></Button>
          <Button type="button" aria-label="Numbered list" title="Numbered list" aria-pressed={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></Button>
          <Button type="button" aria-label="Checklist" title="Checklist" aria-pressed={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}><ListTodo size={14} /></Button>
        </div>
        {linkOpen && <form className="description-link-form" onSubmit={event => {
          event.preventDefault();
          const href = linkURL.trim();
          if (href) {
            try {
              if (!['https:', 'http:', 'mailto:'].includes(new URL(href).protocol)) throw new Error('Unsupported link');
            } catch { setLinkError('Use an https://, http:// or mailto: link.'); return; }
          }
          if (href) editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
          else editor.chain().focus().extendMarkRange('link').unsetLink().run();
          setLinkOpen(false);
        }}><Input autoFocus aria-label="Link URL" placeholder="https://…" value={linkURL} onChange={event => setLinkURL(event.target.value)} /><Button type="submit" aria-label="Apply link"><Check size={15} /></Button>{linkError && <small role="alert">{linkError}</small>}</form>}
      </div>
    </BubbleMenu>}
    {focused && !readOnly && !draft && <div className="description-edit-actions"><span>Esc to cancel · ⌘/Ctrl+Enter to save</span><Button type="button" className="bare-icon" aria-label="Cancel description editing" onClick={() => { finish(true); editor.commands.blur(); }}><X size={14} /></Button><Button type="button" className="light-button" onClick={() => { finish(); editor.commands.blur(); }}>Save <Check size={14} /></Button></div>}
  </div>;
}
