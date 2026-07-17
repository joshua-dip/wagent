"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, Stethoscope } from "lucide-react"

interface Question { _id: string; prompt: string; choices: { text: string }[] }
interface SetRow { setName: string; count: number }

const SAMPLE = 25

/* ── 레벨 선택 (세트 없음) ── */
function SetPicker() {
  const router = useRouter()
  const [sets, setSets] = useState<SetRow[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch("/api/curator/sets").then((r) => r.json()).then((d) => setSets(d.sets || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const group = (prefix: string) => sets.filter((s) => s.setName.startsWith(prefix + "-") || s.setName === prefix)
  const etc = sets.filter((s) => !s.setName.startsWith("중등") && !s.setName.startsWith("고등"))
  const go = (s: string) => router.push(`/curator/diagnose?set=${encodeURIComponent(s)}`)
  const label = (setName: string, prefix: string) => setName.replace(prefix + "-", "") || setName

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
  if (sets.length === 0) return <div className="text-center py-16 text-slate-500 text-sm">진단 문항이 아직 없습니다. (관리자: 시드/이관 필요)</div>

  const Block = ({ title, prefix }: { title: string; prefix: string }) => {
    const rows = group(prefix)
    if (rows.length === 0) return null
    return (
      <div>
        <p className="text-sm font-semibold text-slate-800 mb-2">{title}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {rows.map((s) => (
            <button key={s.setName} onClick={() => go(s.setName)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center hover:border-emerald-300 hover:shadow-sm transition-colors">
              <p className="text-sm font-medium text-slate-800">{label(s.setName, prefix)}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.count}문항</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">레벨을 골라 진단을 시작하세요. 약한 대단원을 찾아 드립니다.</p>
      <Block title="중등" prefix="중등" />
      <Block title="고등" prefix="고등" />
      {etc.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-800 mb-2">기타</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {etc.map((s) => (
              <button key={s.setName} onClick={() => go(s.setName)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center hover:border-emerald-300">
                <p className="text-sm font-medium text-slate-800">{s.setName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.count}문항</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 진단 진행 (세트 선택됨) ── */
function Quiz({ setName }: { setName: string }) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionIdRef = useRef<string>("")

  useEffect(() => {
    sessionIdRef.current = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    fetch(`/api/curator/questions?set=${encodeURIComponent(setName)}&sample=${SAMPLE}`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions || []))
      .catch(() => setError("문항을 불러오지 못했습니다."))
      .finally(() => setLoading(false))
  }, [setName])

  const answeredCount = Object.keys(answers).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  const submit = async () => {
    if (!allAnswered) return
    setSubmitting(true); setError(null)
    try {
      const res = await fetch("/api/curator/diagnose", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ sessionId: sessionIdRef.current, setName, answers: questions.map((q) => ({ questionId: q._id, selected: answers[q._id] })) }),
      })
      const data = await res.json()
      if (res.ok && data.resultId) router.push(`/curator/result/${data.resultId}`)
      else { setError(data.error || "진단 처리에 실패했습니다."); setSubmitting(false) }
    } catch { setError("네트워크 오류가 발생했습니다."); setSubmitting(false) }
  }

  if (loading) return <div className="flex flex-col items-center justify-center py-24 gap-3"><Loader2 className="h-9 w-9 text-emerald-500 animate-spin" /><p className="text-slate-500 text-sm">문항을 준비하는 중…</p></div>
  if (questions.length === 0) return <div className="text-center py-20 text-slate-500 text-sm">이 레벨에 진단 문항이 없습니다.</div>

  return (
    <>
      {error && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}
      <div className="sticky top-16 sm:top-[4.5rem] z-10 bg-white/90 backdrop-blur py-2 mb-2">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1"><span>{setName} · 진행 {answeredCount}/{questions.length}</span></div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
      </div>
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={q._id} className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="font-medium text-slate-900 mb-3 whitespace-pre-line"><span className="text-emerald-600 font-bold mr-1.5">Q{qi + 1}.</span><span dangerouslySetInnerHTML={{ __html: q.prompt }} /></p>
            <div className="space-y-2">
              {q.choices.map((c, ci) => (
                <button key={ci} type="button" onClick={() => setAnswers((prev) => ({ ...prev, [q._id]: ci }))}
                  className={cn("w-full text-left rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                    answers[q._id] === ci ? "border-emerald-400 bg-emerald-50 text-emerald-900 font-medium" : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-700")}>
                  <span dangerouslySetInnerHTML={{ __html: c.text }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={submit} disabled={!allAnswered || submitting} className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-6 text-base font-semibold disabled:opacity-50">
        {submitting ? "큐레이터가 처방하는 중…" : allAnswered ? "진단 결과 보기" : `${questions.length - answeredCount}문항 더 답해주세요`}
      </Button>
    </>
  )
}

function DiagnoseInner() {
  const searchParams = useSearchParams()
  const setName = searchParams.get("set") || ""
  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white"><Stethoscope className="h-5 w-5" /></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">문법 진단</h1>
              <p className="text-sm text-slate-500">{setName ? "약한 대단원을 찾는 진단입니다." : "레벨을 골라 시작하세요."}</p>
            </div>
          </div>
          {setName ? <Quiz setName={setName} /> : <SetPicker />}
        </div>
      </div>
    </Layout>
  )
}

export default function CuratorDiagnosePage() {
  return (
    <Suspense fallback={<Layout><div className="py-24 text-center text-slate-500 text-sm">불러오는 중…</div></Layout>}>
      <DiagnoseInner />
    </Suspense>
  )
}
