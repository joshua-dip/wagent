import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 판매 중인 조건영작배열 상품에서 **실제 존재하는 회차·학년을 집계**해 돌려준다.
 *
 * 홈의 회차 칩이 하드코딩이던 시절, 새 회차를 적재해도 목록에 없어서 화면에
 * 뜨지 않는 사고가 있었다(26년 9월). 이제 상품 태그를 진실의 원천으로 삼는다.
 *   태그 예: ["고3", "26년 9월", "조건영작배열", ...]
 *
 * 응답: { ok, exams: [{ id, label, round, grades }] }  — 최신 회차 먼저
 */
const YEAR_MONTH = /^(\d{2})년\s*(\d{1,2})월$/
const GRADES = ['고1', '고2', '고3'] as const

export async function GET() {
  try {
    await connectDB()
    const rows = await Product.find({ isActive: true, tags: '조건영작배열' })
      .select('tags')
      .lean()

    /** "26년 9월" → Set<"고1"|"고2"|"고3"> */
    const byExam = new Map<string, Set<string>>()
    for (const r of rows as unknown as Array<{ tags?: string[] }>) {
      const tags = Array.isArray(r.tags) ? r.tags : []
      const exam = tags.find((t) => YEAR_MONTH.test(String(t).trim()))
      if (!exam) continue
      const key = String(exam).trim()
      if (!byExam.has(key)) byExam.set(key, new Set())
      const set = byExam.get(key)!
      for (const g of GRADES) if (tags.includes(g)) set.add(g)
    }

    const exams = [...byExam.entries()]
      .map(([label, gradeSet]) => {
        const m = label.match(YEAR_MONTH)!
        const yy = m[1]
        const mm = m[2].padStart(2, '0')
        return {
          id: label,
          label,
          round: `${yy}-${mm}`,
          grades: GRADES.filter((g) => gradeSet.has(g)),
          sortKey: Number(`${yy}${mm}`),
        }
      })
      .filter((e) => e.grades.length > 0)
      .sort((a, b) => b.sortKey - a.sortKey)
      .map(({ sortKey: _sortKey, ...e }) => e)

    return NextResponse.json({ ok: true, exams })
  } catch (err) {
    console.error('exam-rounds 집계 실패:', err)
    return NextResponse.json({ ok: false, exams: [] })
  }
}
