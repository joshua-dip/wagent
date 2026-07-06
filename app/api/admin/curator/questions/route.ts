import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import DiagnosticQuestion from '@/models/DiagnosticQuestion'
import { requireAdmin } from '@/lib/adminAuth'
import { normalizeQuestionInput, validateQuestion } from '@/lib/curator-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  await connectDB()
  const setName = request.nextUrl.searchParams.get('set')?.trim()
  const filter = setName ? { setName } : {}
  const questions = await DiagnosticQuestion.find(filter).sort({ setName: 1, order: 1 }).lean()
  const sets = (await DiagnosticQuestion.distinct('setName')) as string[]
  return NextResponse.json({
    questions: (questions as Array<Record<string, unknown>>).map((q) => ({ ...q, _id: String(q._id) })),
    sets: sets.sort(),
  })
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: '요청 형식 오류' }, { status: 400 }) }
  const doc = normalizeQuestionInput(body)
  if (!doc.setName) doc.setName = 'default'
  const err = validateQuestion(doc)
  if (err) return NextResponse.json({ error: err }, { status: 400 })
  await connectDB()
  const created = await DiagnosticQuestion.create(doc)
  return NextResponse.json({ success: true, id: String(created._id) })
}
