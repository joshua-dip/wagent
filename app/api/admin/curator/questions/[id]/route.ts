import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import connectDB from '@/lib/db'
import DiagnosticQuestion from '@/models/DiagnosticQuestion'
import { requireAdmin } from '@/lib/adminAuth'
import { normalizeQuestionInput } from '@/lib/curator-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const { id } = await params
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: '유효하지 않은 ID' }, { status: 400 })
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: '요청 형식 오류' }, { status: 400 }) }
  await connectDB()
  await DiagnosticQuestion.updateOne({ _id: new ObjectId(id) }, { $set: normalizeQuestionInput(body) })
  return NextResponse.json({ success: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const { id } = await params
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: '유효하지 않은 ID' }, { status: 400 })
  await connectDB()
  await DiagnosticQuestion.deleteOne({ _id: new ObjectId(id) })
  return NextResponse.json({ success: true })
}
