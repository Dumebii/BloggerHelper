"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlock from "@tiptap/extension-code-block";
import Underline from "@tiptap/extension-underline";
import { uploadLargeAsset } from "@/lib/utils";

// Custom Link extension that allows the 'style' attribute (for button styling)
const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => ({ style: attributes.style }),
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = "Write your newsletter content..." }: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
      }),
      CustomLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 underline",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: "max-w-full h-auto rounded-lg my-2" },
      }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CodeBlock,
      Underline,
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
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) return null;

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadLargeAsset(file);
      setImageUrl(url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Convert video URL to email‑safe clickable thumbnail
  const insertEmbed = () => {
    if (!embedUrl.trim()) return;
    let videoUrl = embedUrl;

    // Extract iframe src if present
    if (embedUrl.includes('<iframe')) {
      const srcMatch = embedUrl.match(/src=["'](https?:\/\/[^"']+)["']/);
      if (srcMatch) videoUrl = srcMatch[1];
      else {
        toast.error("Could not extract URL from embed code.");
        return;
      }
    }

    // Get video ID and thumbnail
    let videoId = '';
    let thumbnailUrl = '';
    let finalWatchUrl = videoUrl;

    // YouTube
    if (videoUrl.includes('youtu.be/') || videoUrl.includes('youtube.com/watch')) {
      const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w-]{10,12})\b/);
      if (match) {
        videoId = match[1];
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
        finalWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    // Vimeo
    else if (videoUrl.includes('vimeo.com/')) {
      const match = videoUrl.match(/vimeo\.com\/(\d+)/);
      if (match) {
        videoId = match[1];
        thumbnailUrl = `https://vumbnail.com/${videoId}.jpg`;
        finalWatchUrl = `https://vimeo.com/${videoId}`;
      }
    }

    if (thumbnailUrl) {
      // Insert a clickable image (email‑safe)
      const html = `<a href="${finalWatchUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block;"><img src="${thumbnailUrl}" alt="Video thumbnail" style="max-width:100%; height:auto; border-radius:8px;"></a>`;
      editor.chain().focus().insertContent(html).run();
    } else {
      // Fallback to text link
      editor.chain().focus().insertContent({
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "▶️ Watch video",
            marks: [
              {
                type: "link",
                attrs: {
                  href: finalWatchUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: "color: #4f46e5; text-decoration: underline;",
                },
              },
            ],
          },
        ],
      }).run();
    }
    setIsEmbedModalOpen(false);
    setEmbedUrl("");
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent({
        type: "text",
        text: linkUrl,
        marks: [{ type: "link", attrs: { href: linkUrl, target: "_blank", rel: "noopener noreferrer" } }],
      }).run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl("");
  };

  const insertImage = () => {
    if (!imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setIsImageModalOpen(false);
    setImageUrl("");
  };

  const insertButton = () => {
    if (!buttonText.trim()) return;
    const url = buttonUrl.trim() || "#";
    editor.chain().focus().insertContent({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: buttonText,
          marks: [
            {
              type: "link",
              attrs: {
                href: url,
                target: "_blank",
                rel: "noopener noreferrer",
                style: "display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;",
              },
            },
          ],
        },
      ],
    }).run();
    setIsButtonModalOpen(false);
    setButtonText("");
    setButtonUrl("");
  };

  const buttonClass = (isActive: boolean) => `
    p-2 rounded text-sm font-medium transition-colors
    ${isActive 
      ? "bg-indigo-100 text-indigo-800" 
      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
    }
  `;

  const openLinkModal = () => {
    const { from, to } = editor.state.selection;
    let currentLink = "";
    if (from !== to) {
      editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.marks?.some(mark => mark.type.name === 'link')) {
          const linkMark = node.marks.find(m => m.type.name === 'link');
          if (linkMark) currentLink = linkMark.attrs.href;
        }
      });
    }
    setLinkUrl(currentLink);
    setIsLinkModalOpen(true);
  };

  const colors = ["#000000", "#4f46e5", "#ef4444", "#10b981", "#f59e0b", "#6b7280"];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white relative flex flex-col">
      {/* Toolbar (sticky) */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-2 flex flex-wrap gap-1">
        <button
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive("bold"))}
        >
          <strong>B</strong>
        </button>
        <button
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive("italic"))}
        >
          <em>I</em>
        </button>
        <button
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={buttonClass(editor.isActive("underline"))}
        >
          <u>U</u>
        </button>
        <button
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
        >
          H2
        </button>
        <button
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 3 }))}
        >
          H3
        </button>
        <button
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive("bulletList"))}
        >
          • List
        </button>
        <button
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive("orderedList"))}
        >
          1. List
        </button>
        <button
          title="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
        >
          ―
        </button>
        <button
          title="Align Left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={buttonClass(editor.isActive({ textAlign: 'left' }))}
        >
          ←
        </button>
        <button
          title="Align Center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={buttonClass(editor.isActive({ textAlign: 'center' }))}
        >
          ↔
        </button>
        <button
          title="Align Right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={buttonClass(editor.isActive({ textAlign: 'right' }))}
        >
          →
        </button>
        <button
          title="Justify"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={buttonClass(editor.isActive({ textAlign: 'justify' }))}
        >
          ≡
        </button>
        <div className="relative">
          <button
            title="Text Color"
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }}
          >
            🎨
          </button>
          {isColorPickerOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 flex gap-2 z-20">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setIsColorPickerOpen(false);
                  }}
                  className="w-6 h-6 rounded-full border border-slate-200"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setIsColorPickerOpen(false);
                }}
                className="text-xs px-2 py-1 bg-slate-100 rounded"
              >
                Reset
              </button>
            </div>
          )}
        </div>
        <button
          title="Code Block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={buttonClass(editor.isActive("codeBlock"))}
        >
          {'<>'}
        </button>
        <button
          title="Link"
          onClick={openLinkModal}
          className={buttonClass(editor.isActive("link"))}
        >
          🔗 Link
        </button>
        <button
          title="Insert Image"
          onClick={() => setIsImageModalOpen(true)}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
        >
          🖼️ Image
        </button>
        <button
          title="Insert Video (YouTube/Vimeo)"
          onClick={() => setIsEmbedModalOpen(true)}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
        >
          📺 Video
        </button>
        <button
          title="Insert Button"
          onClick={() => setIsButtonModalOpen(true)}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
        >
          🔘 Button
        </button>
        <button
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
        >
          ↺
        </button>
        <button
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
        >
          ↻
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
        <EditorContent editor={editor} />
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 className="text-lg text-brand-red font-black mb-4">Insert/Edit Link</h3>
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full text-brand-navy border border-slate-200 rounded-xl px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={insertLink} className="px-4 py-2 bg-brand-navy text-white rounded-lg">Insert/Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 className="text-lg text-brand-red font-black mb-4">Insert Image</h3>
            <input
              type="text"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-brand-navy border border-slate-200 rounded-xl px-3 py-2 mb-2"
            />
            <div className="flex gap-2 mb-4">
              <label className="flex-1 text-center bg-slate-100 text-slate-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-200">
                {isUploading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                  }}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsImageModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={insertImage} className="px-4 py-2 bg-brand-navy text-white rounded-lg">Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* Embed (Video) Modal */}
      {isEmbedModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 className="text-lg text-brand-red font-black mb-4">Insert Video (YouTube/Vimeo)</h3>
            <p className="text-xs text-slate-500 mb-2">
              Paste a YouTube or Vimeo URL. A clickable thumbnail will be inserted.
            </p>
            <input
              type="url"
              placeholder="https://youtu.be/... or <iframe ...>"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              className="w-full text-brand-navy border border-slate-200 rounded-xl px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEmbedModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={insertEmbed} className="px-4 py-2 bg-brand-navy text-white rounded-lg">Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* Button Modal */}
      {isButtonModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 className="text-lg text-brand-red font-black mb-4">Insert Button</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Button Text</label>
                <input
                  type="text"
                  placeholder="e.g., Learn More"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full border border-slate-200 text-brand-navy rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Button URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  className="w-full border border-slate-200 text-brand-navy rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsButtonModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={insertButton} className="px-4 py-2 bg-brand-navy text-white rounded-lg">Insert</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
