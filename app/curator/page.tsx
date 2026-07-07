"use client"

import Link from "next/link"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { BookMarked, Stethoscope, Library, ArrowRight } from "lucide-react"

export default function CuratorLandingPage() {
  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Hero */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 mb-5">
              <BookMarked className="h-3.5 w-3.5" /> 문법 큐레이션 서가
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">그래머 큐레이터</h1>
            <p className="text-slate-600 mt-4 leading-relaxed">
              두꺼운 문법책 한 권이 아니라, <b className="text-slate-800">잘게 쪼갠 얇은 모듈</b>의 서가입니다.<br className="hidden sm:block" />
              진단으로 당신의 약한 서가만 찾아, 큐레이터가 <b className="text-slate-800">필요한 권</b>만 골라 처방합니다.
            </p>
          </div>

          {/* 3 steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10">
            {[
              { icon: Stethoscope, t: "1. 진단", d: "QR로 시작하는 짧은 문법 진단" },
              { icon: BookMarked, t: "2. 처방", d: "약점 서가에 맞는 청구기호 추천" },
              { icon: Library, t: "3. 학습", d: "필요한 얇은 모듈만 받아 학습" },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">{s.t}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link href="/curator/diagnose">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-6 text-base font-semibold">
                <Stethoscope className="h-4 w-4 mr-2" /> 진단 시작하기
              </Button>
            </Link>
            <Link href="/curator/library">
              <Button variant="outline" className="w-full sm:w-auto px-6 py-6 text-base font-semibold border-slate-200 text-slate-700">
                <Library className="h-4 w-4 mr-2" /> 전체 서가 둘러보기 <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          <p className="text-center mt-6">
            <Link href="/curator/practice" className="text-sm font-medium text-emerald-700 hover:underline">또는 문법 문제은행에서 바로 연습하기 →</Link>
          </p>

          <p className="text-center text-xs text-slate-400 mt-8">
            청구기호 예) <span className="font-mono text-slate-500">GC-101 문장의 5형식</span> · <span className="font-mono text-slate-500">GC-401 관계대명사</span>
          </p>
        </div>
      </div>
    </Layout>
  )
}
