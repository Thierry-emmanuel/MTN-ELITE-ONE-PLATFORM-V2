import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, Heading3, LinkIcon, ImageIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Imposed extension set per skill 08:
 * - H1 disabled (reserved for the article title stored separately in DB)
 * - Image/Link get fixed classNames for editorial consistency
 */
export function RichTextEditor({ label, value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl max-w-full my-6 border border-stone-200' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-emerald-600 underline font-medium hover:text-emerald-700' },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Racontez l'histoire du match, insérez les analyses techniques...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const promptForLink = () => {
    const url = window.prompt('URL du lien');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const promptForImage = () => {
    const url = window.prompt('URL de l\'image');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div>
      <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">{label}</label>
      <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-stone-200 bg-stone-50">
          <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-3.5 w-3.5" /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-3.5 w-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={promptForLink}><LinkIcon className="h-3.5 w-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={promptForImage}><ImageIcon className="h-3.5 w-3.5" /></ToolbarBtn>
        </div>
        <EditorContent editor={editor} className="prose prose-stone max-w-none px-4 py-3 min-h-[220px] focus:outline-none" />
      </div>
    </div>
  );
}

function ToolbarBtn({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 w-7 grid place-items-center rounded-lg transition-colors ${
        active ? 'bg-emerald-100 text-emerald-700' : 'text-stone-500 hover:bg-stone-100'
      }`}
    >
      {children}
    </button>
  );
}