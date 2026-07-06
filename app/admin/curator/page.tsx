"use client"

import { useCallback, useEffect, useState } from "react"
import AdminLayout from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Tab = "modules" | "questions" | "qr" | "stats"

interface ModuleRow {
  _id: string; code: string; category: string; title: string; description: string
  pages: number; pdfRef: string; diagnosticTags: string[]; order: number; isActive: boolean
}
interface Choice { text: string; isCorrect: boolean }
interface QuestionRow {
  _id: string; prompt: string; choices: Choice[]; tags: string[]
  difficulty: number; setName: string; order: number; isActive: boolean
}
interface Stats {
  totalResults: number; avgScore: number; avgTotal: number
  weakTags: { tag: string; count: number }[]; modules: { code: string; count: number }[]
}

const TABS: { key: Tab; label: string }[] = [
  { key: "modules", label: "모듈" },
  { key: "questions", label: "진단 문항" },
  { key: "qr", label: "진단셋 QR" },
  { key: "stats", label: "통계" },
]

export default function AdminCuratorPage() {
  const [tab, setTab] = useState<Tab>("modules")
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">그래머 큐레이터</h1>
          <p className="text-sm text-slate-500 mt-0.5">모듈·진단 문항 관리, QR 발급, 진단 통계</p>
        </div>
        <div className="flex gap-1 border-b border-slate-200">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn("px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
                tab === t.key ? "border-emerald-500 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800")}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "modules" && <ModulesTab />}
        {tab === "questions" && <QuestionsTab />}
        {tab === "qr" && <QrTab />}
        {tab === "stats" && <StatsTab />}
      </div>
    </AdminLayout>
  )
}

/* ─── 모듈 ─── */
const EMPTY_MODULE = { code: "", category: "", title: "", description: "", pages: 0, pdfRef: "", diagnosticTags: "", order: 0, isActive: true }

function ModulesTab() {
  const [rows, setRows] = useState<ModuleRow[]>([])
  const [form, setForm] = useState<typeof EMPTY_MODULE>(EMPTY_MODULE)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/curator/modules", { credentials: "include" })
    const d = await r.json(); if (d.modules) setRows(d.modules)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async () => {
    setBusy(true)
    const body = { ...form, diagnosticTags: form.diagnosticTags }
    const url = editingId ? `/api/admin/curator/modules/${editingId}` : "/api/admin/curator/modules"
    const r = await fetch(url, { method: editingId ? "PATCH" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    const d = await r.json(); setBusy(false)
    if (r.ok && d.success) { setForm(EMPTY_MODULE); setEditingId(null); load() } else alert(d.error || "실패")
  }
  const edit = (m: ModuleRow) => { setEditingId(m._id); setForm({ ...m, diagnosticTags: (m.diagnosticTags || []).join(", ") } as unknown as typeof EMPTY_MODULE) }
  const del = async (id: string) => { if (!confirm("이 모듈을 삭제할까요?")) return; await fetch(`/api/admin/curator/modules/${id}`, { method: "DELETE", credentials: "include" }); load() }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900 mb-3">{editingId ? "모듈 수정" : "모듈 추가"}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          <Input placeholder="청구기호 GC-101" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input placeholder="대분류 (문장구조)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input placeholder="제목" className="col-span-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <Input placeholder="소개 (문학적 톤)" className="mb-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          <Input type="number" placeholder="쪽수" value={form.pages || ""} onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })} />
          <Input type="number" placeholder="정렬 order" value={form.order || ""} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          <Input placeholder="진단태그 (쉼표)" value={form.diagnosticTags} onChange={(e) => setForm({ ...form, diagnosticTags: e.target.value })} />
          <Input placeholder="PDF 상품 ID (선택)" value={form.pdfRef} onChange={(e) => setForm({ ...form, pdfRef: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-slate-600"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> 활성</label>
          <Button onClick={save} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 text-white">{editingId ? "수정" : "추가"}</Button>
          {editingId && <Button variant="ghost" onClick={() => { setEditingId(null); setForm(EMPTY_MODULE) }}>취소</Button>}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {rows.length === 0 ? <p className="p-6 text-center text-sm text-slate-400">모듈이 없습니다.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 text-left text-xs text-slate-500">
              <th className="px-3 py-2">청구기호</th><th className="px-3 py-2">제목</th><th className="px-3 py-2">태그</th><th className="px-3 py-2">PDF</th><th className="px-3 py-2"></th>
            </tr></thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-2 font-mono text-emerald-700">{m.code}{!m.isActive && <span className="ml-1 text-[10px] text-slate-400">(비활성)</span>}</td>
                  <td className="px-3 py-2"><span className="text-slate-400 text-xs">{m.category}</span> {m.title}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{(m.diagnosticTags || []).join(", ")}</td>
                  <td className="px-3 py-2 text-xs">{m.pdfRef ? "✓" : <span className="text-slate-300">준비중</span>}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button onClick={() => edit(m)} className="text-xs text-slate-500 hover:text-emerald-700 mr-2">수정</button>
                    <button onClick={() => del(m._id)} className="text-xs text-red-500 hover:text-red-700">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* ─── 문항 ─── */
const EMPTY_Q = { prompt: "", setName: "default", tags: "", difficulty: 1, order: 0, isActive: true }
function QuestionsTab() {
  const [rows, setRows] = useState<QuestionRow[]>([])
  const [form, setForm] = useState<typeof EMPTY_Q>(EMPTY_Q)
  const [choices, setChoices] = useState<Choice[]>([{ text: "", isCorrect: true }, { text: "", isCorrect: false }])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/curator/questions", { credentials: "include" })
    const d = await r.json(); if (d.questions) setRows(d.questions)
  }, [])
  useEffect(() => { load() }, [load])

  const reset = () => { setEditingId(null); setForm(EMPTY_Q); setChoices([{ text: "", isCorrect: true }, { text: "", isCorrect: false }]) }
  const save = async () => {
    setBusy(true)
    const body = { ...form, tags: form.tags, choices: choices.filter((c) => c.text.trim()) }
    const url = editingId ? `/api/admin/curator/questions/${editingId}` : "/api/admin/curator/questions"
    const r = await fetch(url, { method: editingId ? "PATCH" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    const d = await r.json(); setBusy(false)
    if (r.ok && d.success) { reset(); load() } else alert(d.error || "실패")
  }
  const edit = (q: QuestionRow) => { setEditingId(q._id); setForm({ prompt: q.prompt, setName: q.setName, tags: (q.tags || []).join(", "), difficulty: q.difficulty, order: q.order, isActive: q.isActive }); setChoices(q.choices?.length ? q.choices : [{ text: "", isCorrect: true }]) }
  const del = async (id: string) => { if (!confirm("이 문항을 삭제할까요?")) return; await fetch(`/api/admin/curator/questions/${id}`, { method: "DELETE", credentials: "include" }); load() }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900 mb-3">{editingId ? "문항 수정" : "문항 추가"}</p>
        <Input placeholder="문항 (prompt)" className="mb-2" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
        <div className="space-y-1.5 mb-2">
          {choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-slate-500 shrink-0"><input type="checkbox" checked={c.isCorrect} onChange={(e) => setChoices(choices.map((x, j) => j === i ? { ...x, isCorrect: e.target.checked } : x))} /> 정답</label>
              <Input placeholder={`선택지 ${i + 1}`} value={c.text} onChange={(e) => setChoices(choices.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
              {choices.length > 2 && <button onClick={() => setChoices(choices.filter((_, j) => j !== i))} className="text-red-400 text-xs shrink-0">✕</button>}
            </div>
          ))}
          <button onClick={() => setChoices([...choices, { text: "", isCorrect: false }])} className="text-xs text-emerald-600">+ 선택지 추가</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          <Input placeholder="진단셋 (default)" value={form.setName} onChange={(e) => setForm({ ...form, setName: e.target.value })} />
          <Input placeholder="태그 (쉼표)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <Input type="number" placeholder="난도 1~5" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })} />
          <Input type="number" placeholder="order" value={form.order || ""} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 text-white">{editingId ? "수정" : "추가"}</Button>
          {editingId && <Button variant="ghost" onClick={reset}>취소</Button>}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-50">
        {rows.length === 0 ? <p className="p-6 text-center text-sm text-slate-400">문항이 없습니다.</p> :
          rows.map((q) => (
            <div key={q._id} className="p-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-slate-800"><span className="text-[10px] font-mono text-slate-400 mr-1">[{q.setName}]</span>{q.prompt}</p>
                <p className="text-xs text-slate-500 mt-0.5">정답: {q.choices?.filter((c) => c.isCorrect).map((c) => c.text).join(", ")} · 태그 {(q.tags || []).join(", ")}</p>
              </div>
              <div className="shrink-0 whitespace-nowrap">
                <button onClick={() => edit(q)} className="text-xs text-slate-500 hover:text-emerald-700 mr-2">수정</button>
                <button onClick={() => del(q._id)} className="text-xs text-red-500 hover:text-red-700">삭제</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

/* ─── QR ─── */
function QrTab() {
  const [setName, setSetName] = useState("default")
  const [base, setBase] = useState("")
  const [img, setImg] = useState("")
  useEffect(() => { if (typeof window !== "undefined") setBase(window.location.origin) }, [])
  const url = `${base}/curator/diagnose?set=${encodeURIComponent(setName)}`
  const gen = async () => {
    try {
      const QRCode = (await import("qrcode")).default
      setImg(await QRCode.toDataURL(url, { width: 480, margin: 2 }))
    } catch { alert("QR 생성 실패") }
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 max-w-md">
      <p className="text-sm font-semibold text-slate-900 mb-3">진단셋 QR 발급</p>
      <label className="text-xs text-slate-500">진단셋 이름</label>
      <Input value={setName} onChange={(e) => setSetName(e.target.value)} className="mb-2" />
      <label className="text-xs text-slate-500">진단 URL</label>
      <Input value={url} readOnly className="mb-3 font-mono text-xs" />
      <Button onClick={gen} className="bg-emerald-600 hover:bg-emerald-700 text-white">QR 생성</Button>
      {img && (
        <div className="mt-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="진단 QR" className="mx-auto w-56 h-56 border border-slate-200 rounded-lg" />
          <a href={img} download={`curator-qr-${setName}.png`} className="inline-block mt-3 text-sm text-emerald-700 underline">PNG 다운로드</a>
        </div>
      )}
    </div>
  )
}

/* ─── 통계 ─── */
function StatsTab() {
  const [s, setS] = useState<Stats | null>(null)
  useEffect(() => { fetch("/api/admin/curator/stats", { credentials: "include" }).then((r) => r.json()).then(setS).catch(() => {}) }, [])
  if (!s) return <p className="text-sm text-slate-400 py-8">불러오는 중…</p>
  const max = Math.max(1, ...s.weakTags.map((w) => w.count))
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">총 진단</p><p className="text-2xl font-bold text-slate-900">{s.totalResults}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">평균 점수</p><p className="text-2xl font-bold text-slate-900">{s.avgScore} / {s.avgTotal}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">약점 태그 종류</p><p className="text-2xl font-bold text-slate-900">{s.weakTags.length}</p></div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900 mb-3">약점으로 자주 잡힌 태그</p>
        {s.weakTags.length === 0 ? <p className="text-sm text-slate-400">데이터 없음</p> : s.weakTags.map((w) => (
          <div key={w.tag} className="flex items-center gap-2 mb-1.5">
            <span className="w-40 text-xs text-slate-600 truncate">{w.tag}</span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(w.count / max) * 100}%` }} /></div>
            <span className="w-8 text-right text-xs text-slate-500">{w.count}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900 mb-2">추천 많이 된 모듈</p>
        <div className="flex flex-wrap gap-2">
          {s.modules.length === 0 ? <p className="text-sm text-slate-400">데이터 없음</p> : s.modules.map((m) => (
            <span key={m.code} className="text-xs font-mono bg-emerald-50 text-emerald-700 rounded px-2 py-1">{m.code} · {m.count}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
