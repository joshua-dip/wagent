"use client"

import { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import { Loader2, Library } from "lucide-react"
import { cn } from "@/lib/utils"
import ModuleCard, { CuratorModuleView } from "../_components/ModuleCard"

export default function CuratorLibraryPage() {
  const [modules, setModules] = useState<CuratorModuleView[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [category, setCategory] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const qs = category ? `?category=${encodeURIComponent(category)}` : ""
    fetch(`/api/curator/modules${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.modules) setModules(d.modules)
        if (d.categories) setCategories(d.categories)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category])

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">문법 서가</h1>
              <p className="text-sm text-slate-500">청구기호순으로 정리된 전체 모듈</p>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-1 my-5 scrollbar-none">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === "" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-200")}
            >
              전체
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  category === c ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-200")}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-9 w-9 text-emerald-500 animate-spin" />
              <p className="text-slate-500 text-sm">서가를 정리하는 중…</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">아직 등록된 모듈이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m) => <ModuleCard key={m.code} module={m} />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
