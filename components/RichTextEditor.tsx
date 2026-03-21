"use client";
import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import ImageInsertModal from "./ImageInsertModal";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = "Write your newsletter content..." }: RichTextEditorProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        bulletList: {
          HTMLAttributes: { class: "list-disc ml-4" },
        },
        orderedList: {
          HTMLAttributes: { class: "list-decimal ml-4" },
        },
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-2",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-slate-900 bg-white",
      },
    },
  });

  if (!editor) return null;

  const buttonClass = (isActive: boolean) => `
    p-2 rounded text-sm font-medium
    ${isActive 
      ? "bg-slate-200 text-slate-900" 
      : "bg-white text-slate-700 hover:bg-slate-100"
    }
    border border-slate-200
  `;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-950 p-2 flex flex-wrap gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive("bold"))}
          type="button"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive("italic"))}
          type="button"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 3 }))}
          type="button"
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive("bulletList"))}
          type="button"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive("orderedList"))}
          type="button"
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          type="button"
        >
          ―
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          type="button"
        >
          ↺ UNDO
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          type="button"
        >
          ↻ REDO
        </button>
        <button
          onClick={() => setIsImageModalOpen(true)}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          type="button"
          title="Insert image"
        >
          Add Image
        </button>
      </div>
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
      <ImageInsertModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={(url) => {
          editor.chain().focus().setImage({ src: url }).run();
        }}
      />
    </div>
  );
}