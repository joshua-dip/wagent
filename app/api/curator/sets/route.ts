import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import DiagnosticQuestion from '@/models/DiagnosticQuestion'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 진단셋 목록 (활성 문항이 있는 setName + 문항 수). 레벨 선택 UI 용. */
export async function GET() {
  try {
    await connectDB()
    const rows = await DiagnosticQuestion.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$setName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    const sets = (rows as Array<{ _id: string; count: number }>).map((r) => ({ setName: r._id || 'default', count: r.count }))
    return NextResponse.json({ sets })
  } catch (e) {
    console.error('진단셋 목록 오류:', e)
    return NextResponse.json({ sets: [] })
  }
}
