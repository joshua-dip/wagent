import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import DiagnosticResult from '@/models/DiagnosticResult'
import { requireAdmin } from '@/lib/adminAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 진단 결과 통계 — 약점 태그 빈도, 추천 모듈 빈도, 평균 점수. */
export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  await connectDB()

  const [totalResults, weakTags, modules, scoreAgg] = await Promise.all([
    DiagnosticResult.countDocuments(),
    DiagnosticResult.aggregate([
      { $unwind: '$weakTags' },
      { $group: { _id: '$weakTags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    DiagnosticResult.aggregate([
      { $unwind: '$recommendedModules' },
      { $group: { _id: '$recommendedModules', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    DiagnosticResult.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' }, avgTotal: { $avg: '$total' } } },
    ]),
  ])

  return NextResponse.json({
    totalResults,
    weakTags: (weakTags as Array<{ _id: string; count: number }>).map((w) => ({ tag: w._id, count: w.count })),
    modules: (modules as Array<{ _id: string; count: number }>).map((m) => ({ code: m._id, count: m.count })),
    avgScore: Math.round(((scoreAgg[0]?.avgScore as number) || 0) * 10) / 10,
    avgTotal: Math.round(((scoreAgg[0]?.avgTotal as number) || 0) * 10) / 10,
  })
}
