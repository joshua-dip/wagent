"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Loader2, BookMarked, CheckCircle2, Library } from "lucide-react"
import ModuleCard, { CuratorModuleView } from "../../_components/ModuleCard"

interface ResultData {
  score: number
  total: number
  weakTags: string[]
  recommendedModules: string[]
  createdAt?: string
}

export default function CuratorResultPage() {
  const params = useParams()
  const id = params?.id as string
  const [result, setResult] = useState<ResultData | null>(null)
  const [modules, setModules] = useState<CuratorModuleView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/curator/result/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.result) { setResult(d.result); setModules(d.modules || []) }
        else setError(d.error || "결과를 찾을 수 없습니다.")
      })
      .catch(() => setError("결과를 불러오지 못했습니다."))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-9 w-9 text-emerald-500 animate-spin" />
              <p className="text-slate-500 text-sm">처방을 정리하는 중…</p>
            </div>
          ) : error || !result ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-sm mb-6">{error || "결과가 없습니다."}</p>
              <Link href="/curator/diagnose"><Button variant="outline">다시 진단하기</Button></Link>
            </div>
          ) : (
            <>
              {/* 점수 */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 mb-4">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 진단 완료 · {result.score} / {result.total} 정답
                </div>
                {modules.length > 0 ? (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">큐레이터가 당신을 위해 {modules.length}권을 골랐습니다</h1>
                    <p className="text-slate-500 mt-3">
                      당신의 처방:{" "}
                      {result.recommendedModules.map((c, i) => (
                        <span key={c} className="font-mono font-semibold text-emerald-700">{c}{i < result.recommendedModules.length - 1 ? ", " : ""}</span>
                      ))}
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">약한 서가가 없네요 👏</h1>
                    <p className="text-slate-500 mt-3">진단 문항을 모두 맞히셨습니다. 전체 서가를 둘러보셔도 좋아요.</p>
                  </>
                )}
              </div>

              {modules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {modules.map((m) => <ModuleCard key={m.code} module={m} />)}
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
                <Link href="/curator/library">
                  <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700">
                    <Library className="h-4 w-4 mr-2" /> 전체 서가 보기
                  </Button>
                </Link>
                <Link href="/curator/diagnose">
                  <Button variant="ghost" className="w-full sm:w-auto text-slate-500">
                    <BookMarked className="h-4 w-4 mr-2" /> 다시 진단
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
