"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function RichTextEditor({ value, onChange }: Readonly<Props>) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[220px] rounded-lg border border-black/15 px-3 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== (value || "")) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-[220px] rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black/60">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-black/10 bg-white px-3 py-1 text-xs font-semibold hover:bg-black/5"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className="rounded-md border border-black/10 bg-white px-3 py-1 text-xs font-semibold hover:bg-black/5"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className="rounded-md border border-black/10 bg-white px-3 py-1 text-xs font-semibold hover:bg-black/5"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </button>
        <button
          type="button"
          className="rounded-md border border-black/10 bg-white px-3 py-1 text-xs font-semibold hover:bg-black/5"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered
        </button>
        <button
          type="button"
          className="rounded-md border border-black/10 bg-white px-3 py-1 text-xs font-semibold hover:bg-black/5"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
