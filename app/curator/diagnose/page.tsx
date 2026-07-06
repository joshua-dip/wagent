"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, Stethoscope } from "lucide-react"

interface Question {
  _id: string
  prompt: string
  choices: { text: string }[]
}

function DiagnoseInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setName = searchParams.get("set") || "default"

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionIdRef = useRef<string>("")

  useEffect(() => {
    sessionIdRef.current = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    fetch(`/api/curator/questions?set=${encodeURIComponent(setName)}`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions || []))
      .catch(() => setError("문항을 불러오지 못했습니다."))
      .finally(() => setLoading(false))
  }, [setName])

  const answeredCount = Object.keys(answers).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  const submit = async () => {
    if (!allAnswered) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/curator/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          setName,
          answers: questions.map((q) => ({ questionId: q._id, selected: answers[q._id] })),
        }),
      })
      const data = await res.json()
      if (res.ok && data.resultId) {
        router.push(`/curator/result/${data.resultId}`)
      } else {
        setError(data.error || "진단 처리에 실패했습니다.")
        setSubmitting(false)
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.")
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">문법 진단</h1>
              <p className="text-sm text-slate-500">약한 서가를 찾기 위한 짧은 진단입니다.</p>
            </div>
          </div>

          {error && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-9 w-9 text-emerald-500 animate-spin" />
              <p className="text-slate-500 text-sm">문항을 준비하는 중…</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">진단 문항이 아직 없습니다.</div>
          ) : (
            <>
              {/* 진행률 */}
              <div className="sticky top-16 sm:top-[4.5rem] z-10 bg-white/90 backdrop-blur py-2 mb-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>진행 {answeredCount} / {questions.length}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, qi) => (
                  <div key={q._id} className="rounded-2xl border border-slate-200/80 bg-white p-5">
                    <p className="font-medium text-slate-900 mb-3"><span className="text-emerald-600 font-bold mr-1.5">Q{qi + 1}.</span>{q.prompt}</p>
                    <div className="space-y-2">
                      {q.choices.map((c, ci) => (
                        <button
                          key={ci}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [q._id]: ci }))}
                          className={cn(
                            "w-full text-left rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                            answers[q._id] === ci
                              ? "border-emerald-400 bg-emerald-50 text-emerald-900 font-medium"
                              : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-700"
                          )}
                        >
                          {c.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={submit}
                disabled={!allAnswered || submitting}
                className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-6 text-base font-semibold disabled:opacity-50"
              >
                {submitting ? "큐레이터가 처방하는 중…" : allAnswered ? "진단 결과 보기" : `${questions.length - answeredCount}문항 더 답해주세요`}
              </Button>
            </>
          )}
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
