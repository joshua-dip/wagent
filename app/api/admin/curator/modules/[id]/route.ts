import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import connectDB from '@/lib/db'
import CuratorModule from '@/models/CuratorModule'
import { requireAdmin } from '@/lib/adminAuth'
import { normalizeModuleInput } from '@/lib/curator-admin'

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
  const set = normalizeModuleInput(body)
  try {
    await CuratorModule.updateOne({ _id: new ObjectId(id) }, { $set: set })
    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = (e as { code?: number }).code === 11000 ? '이미 존재하는 청구기호(code)입니다.' : '수정 실패'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const { id } = await params
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: '유효하지 않은 ID' }, { status: 400 })
  await connectDB()
  await CuratorModule.deleteOne({ _id: new ObjectId(id) })
  return NextResponse.json({ success: true })
}
