"use client"

import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { Color } from "@tiptap/extension-color"
import TextStyle from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import { useCallback, useEffect, useRef } from "react"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Link as LinkIcon,
  Link2Off,
  Image as ImageIcon,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Undo2,
  Redo2,
  Eraser,
  Pilcrow,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const COLORS = [
  "#0f172a", "#475569", "#dc2626", "#ea580c",
  "#ca8a04", "#16a34a", "#0d9488", "#0284c7",
  "#7c3aed", "#db2777",
]

const HIGHLIGHTS = [
  "#fef9c3", "#fde68a", "#bbf7d0", "#bae6fd",
  "#fbcfe8", "#e9d5ff",
]

function TbBtn({
  active,
  onClick,
  title,
  disabled,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        active && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("링크 URL을 입력하세요", prev || "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run()
  }, [editor])

  const insertImageByUrl = useCallback(() => {
    const url = window.prompt("이미지 URL을 입력하세요", "https://")
    if (!url) return
    editor.chain().focus().setImage({ src: url, alt: "" }).run()
  }, [editor])

  const onPickFile = useCallback(
    async (file: File) => {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/blog/upload-image", {
        method: "POST",
        body: fd,
        credentials: "include",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || "이미지 업로드 실패")
        return
      }
      const data = await res.json()
      if (data?.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run()
      }
    },
    [editor]
  )

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 px-2 py-1.5 rounded-t-lg sticky top-0 z-10">
      <TbBtn title="실행 취소" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="다시 실행" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 className="h-4 w-4" />
      </TbBtn>
      <Divider />

      <TbBtn
        title="본문"
        active={editor.isActive("paragraph") && !editor.isActive("heading")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="h-4 w-4" />
      </TbBtn>
      <TbBtn
        title="제목 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </TbBtn>
      <TbBtn
        title="제목 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </TbBtn>
      <TbBtn
        title="제목 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </TbBtn>
      <Divider />

      <TbBtn title="굵게 (Cmd+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="기울임 (Cmd+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="밑줄" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="취소선" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="인라인 코드" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </TbBtn>
      <Divider />

      {/* 색상 팔레트 */}
      <div className="flex items-center gap-1 px-1">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">색상</span>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={`글자 색상 ${c}`}
            onClick={() => editor.chain().focus().setColor(c).run()}
            className="h-4 w-4 rounded-sm ring-1 ring-slate-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
          />
        ))}
        <button
          type="button"
          title="색상 제거"
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="h-4 px-1 text-[10px] text-slate-500 rounded hover:bg-slate-100"
        >
          ✕
        </button>
      </div>
      <Divider />

      <div className="flex items-center gap-1 px-1">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">형광</span>
        {HIGHLIGHTS.map((c) => (
          <button
            key={c}
            type="button"
            title={`형광펜 ${c}`}
            onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
            className="h-4 w-4 rounded-sm ring-1 ring-slate-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
          />
        ))}
        <button
          type="button"
          title="형광 제거"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          className="h-4 px-1 text-[10px] text-slate-500 rounded hover:bg-slate-100"
        >
          ✕
        </button>
      </div>
      <Divider />

      <TbBtn title="글머리 기호 목록" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="번호 매기기 목록" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="인용" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="코드 블록" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="가로줄" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </TbBtn>
      <Divider />

      <TbBtn title="왼쪽 정렬" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="가운데 정렬" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenter className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="오른쪽 정렬" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRight className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="양쪽 정렬" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <AlignJustify className="h-4 w-4" />
      </TbBtn>
      <Divider />

      <TbBtn title="링크 삽입/수정" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="링크 제거" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}>
        <Link2Off className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="이미지 URL 삽입" onClick={insertImageByUrl}>
        <ImageIcon className="h-4 w-4" />
      </TbBtn>
      <TbBtn title="이미지 업로드 (S3)" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4" />
      </TbBtn>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPickFile(f)
          e.target.value = ""
        }}
      />
      <Divider />

      <TbBtn title="서식 지우기" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <Eraser className="h-4 w-4" />
      </TbBtn>
    </div>
  )
}

export default function BlogEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "rounded-md bg-slate-900 text-slate-100 p-4 text-sm overflow-x-auto" } },
        blockquote: { HTMLAttributes: { class: "border-l-4 border-emerald-300 pl-4 italic text-slate-700" } },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-emerald-600 underline underline-offset-2", rel: "noopener nofollow", target: "_blank" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg mx-auto my-3 max-w-full h-auto" },
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || "상품에 대해 자유롭게 작성하세요…",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-slate-300 before:float-left before:pointer-events-none before:h-0",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[420px] focus:outline-none px-5 py-4 prose-headings:font-semibold prose-img:my-3 prose-a:text-emerald-600",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  // value가 외부에서 바뀌면 동기화 (초기 로드 등)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value && value !== current) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="h-10 border-b border-slate-100 bg-slate-50/80 rounded-t-lg" />
        <div className="min-h-[420px] p-5 text-slate-300">에디터 로딩 중…</div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
