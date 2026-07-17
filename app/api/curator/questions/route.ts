import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import DiagnosticQuestion from '@/models/DiagnosticQuestion'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 진단 문항 조회 — 정답(isCorrect)·태그는 숨겨서 내려준다. */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const setName = request.nextUrl.searchParams.get('set')?.trim() || 'default'
    const sample = Math.min(200, Math.max(0, Number(request.nextUrl.searchParams.get('sample')) || 0))
    const qs = sample > 0
      ? await DiagnosticQuestion.aggregate([{ $match: { setName, isActive: true } }, { $sample: { size: sample } }])
      : await DiagnosticQuestion.find({ setName, isActive: true }).sort({ order: 1, createdAt: 1 }).lean()
    const questions = (qs as Array<{ _id: unknown; prompt?: string; choices?: Array<{ text?: string }> }>).map((q) => ({
      _id: String(q._id),
      prompt: q.prompt ?? '',
      choices: (q.choices ?? []).map((c) => ({ text: c.text ?? '' })),
    }))
    return NextResponse.json({ setName, questions })
  } catch (e) {
    console.error('진단 문항 조회 오류:', e)
    return NextResponse.json({ error: '문항을 불러올 수 없습니다.' }, { status: 500 })
  }
}
