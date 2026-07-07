"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, Dumbbell, ChevronLeft, Check, X } from "lucide-react"

interface Topic { topicKey: string; course: string; chapter: string; topic: string; count: number }
interface Item {
  serial: string; topic: string; instruction: string; question: string
  options?: string[]; answer: string; explanation: string
}

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦"]
function correctIndex(options: string[] | undefined, answer: string): number {
  if (!options || !answer) return -1
  for (let i = 0; i < CIRCLED.length && i < options.length; i++) if (answer.includes(CIRCLED[i])) return i
  const a = answer.trim()
  return options.findIndex((o) => o.trim() === a || o.includes(a) || a.includes(o.replace(/^[①-⑩]\s*/, "").trim()))
}

export default function GrammarPracticePage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<"ok" | "unconfigured" | "login" | "error">("ok")
  const [errMsg, setErrMsg] = useState("")

  const [items, setItems] = useState<Item[] | null>(null)
  const [topicLabel, setTopicLabel] = useState("")
  const [qi, setQi] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [loadingQ, setLoadingQ] = useState(false)

  useEffect(() => {
    fetch("/api/grammar-bank/topics", { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401) { setState("login"); return null }
        const d = await r.json()
        if (d.configured === false) { setState("unconfigured"); return null }
        if (!r.ok) { setState("error"); setErrMsg(d.error || "조회 실패"); return null }
        return d
      })
      .then((d) => { if (d?.topics) setTopics(d.topics) })
      .catch(() => setState("error"))
      .finally(() => setLoading(false))
  }, [])

  const startTopic = async (t: Topic) => {
    setLoadingQ(true); setItems(null); setTopicLabel(`${t.topic || t.chapter}`)
    try {
      const r = await fetch(`/api/grammar-bank/questions?topicKey=${encodeURIComponent(t.topicKey)}&sample=10`, { credentials: "include" })
      const d = await r.json()
      setItems((d.items || []).filter((x: Item) => x.options && x.options.length >= 2))
      setQi(0); setSelected(null); setRevealed(false); setScore(0)
    } catch { setItems([]) } finally { setLoadingQ(false) }
  }

  const reveal = () => {
    if (selected == null || !items) return
    const ci = correctIndex(items[qi].options, items[qi].answer)
    if (ci >= 0 && ci === selected) setScore((s) => s + 1)
    setRevealed(true)
  }
  const next = () => { setSelected(null); setRevealed(false); setQi((i) => i + 1) }

  /* 진도 목록으로 (course 별 그룹) */
  const grouped = topics.reduce<Record<string, Topic[]>>((acc, t) => {
    (acc[t.course || "기타"] ||= []).push(t); return acc
  }, {})

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">문법 문제은행 연습</h1>
              <p className="text-sm text-slate-500">진도를 골라 문제를 풀고 바로 해설을 확인하세요.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3"><Loader2 className="h-9 w-9 text-emerald-500 animate-spin" /></div>
          ) : state === "login" ? (
            <div className="text-center py-16">
              <p className="text-slate-500 text-sm mb-5">문제은행 연습은 로그인 후 이용할 수 있어요.</p>
              <Link href="/auth/simple-signin"><Button>로그인</Button></Link>
            </div>
          ) : state === "unconfigured" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
              문법 문제은행이 아직 연결되지 않았습니다. (관리자: <code>GRAMMAR_BANK_API_URL</code> · <code>GRAMMAR_BANK_API_KEY</code> 설정 필요)
            </div>
          ) : state === "error" ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">문제은행을 불러오지 못했습니다. {errMsg}</div>
          ) : items ? (
            /* ── 연습 모드 ── */
            <>
              <button onClick={() => setItems(null)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4"><ChevronLeft className="h-4 w-4" />진도 다시 고르기</button>
              {loadingQ ? (
                <div className="py-16 text-center"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto" /></div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm">이 진도에 풀 수 있는 객관식 문항이 없습니다.</div>
              ) : qi >= items.length ? (
                <div className="text-center py-12">
                  <p className="text-2xl font-bold text-slate-900 mb-2">완료! {score} / {items.length} 정답</p>
                  <p className="text-slate-500 text-sm mb-6">{topicLabel}</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => { setQi(0); setSelected(null); setRevealed(false); setScore(0) }} variant="outline">다시 풀기</Button>
                    <Button onClick={() => setItems(null)}>다른 진도</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>{topicLabel} · {qi + 1}/{items.length}</span><span>맞힘 {score}</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                    {items[qi].instruction && <p className="text-xs text-emerald-700 font-medium mb-2">{items[qi].instruction}</p>}
                    <div className="text-slate-900 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: items[qi].question }} />
                    <div className="space-y-2">
                      {items[qi].options!.map((opt, oi) => {
                        const ci = revealed ? correctIndex(items[qi].options, items[qi].answer) : -1
                        const isCorrect = revealed && oi === ci
                        const isWrongPick = revealed && oi === selected && oi !== ci
                        return (
                          <button key={oi} type="button" disabled={revealed}
                            onClick={() => setSelected(oi)}
                            className={cn("w-full text-left rounded-lg border px-3.5 py-2.5 text-sm transition-colors flex items-center gap-2",
                              isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-900" :
                              isWrongPick ? "border-red-300 bg-red-50 text-red-700" :
                              selected === oi ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 hover:border-emerald-200 text-slate-700")}>
                            <span className="flex-1" dangerouslySetInnerHTML={{ __html: opt }} />
                            {isCorrect && <Check className="h-4 w-4 shrink-0" />}
                            {isWrongPick && <X className="h-4 w-4 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                    {revealed && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-3.5 text-sm">
                        <p className="font-semibold text-slate-800">정답: {items[qi].answer}</p>
                        {items[qi].explanation && <p className="text-slate-600 mt-1.5 leading-relaxed whitespace-pre-wrap">{items[qi].explanation}</p>}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    {!revealed ? (
                      <Button onClick={reveal} disabled={selected == null} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 py-6 text-base font-semibold disabled:opacity-50">정답 확인</Button>
                    ) : (
                      <Button onClick={next} className="w-full bg-slate-800 hover:bg-slate-900 py-6 text-base font-semibold">{qi + 1 < items.length ? "다음 문항" : "결과 보기"}</Button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ── 진도 선택 ── */
            topics.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">연결된 문제은행에 진도가 없습니다.</div>
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).map(([course, ts]) => (
                  <div key={course}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{course}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ts.map((t) => (
                        <button key={t.topicKey} type="button" onClick={() => startTopic(t)}
                          className="text-left rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-emerald-300 hover:shadow-sm transition-colors">
                          <p className="text-sm font-medium text-slate-800">{t.topic || t.chapter}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{t.chapter && t.topic ? `${t.chapter} · ` : ""}{t.count}문항</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  )
}
