import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import CuratorModule from '@/models/CuratorModule'
import { requireAdmin } from '@/lib/adminAuth'
import { normalizeModuleInput } from '@/lib/curator-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  await connectDB()
  const modules = await CuratorModule.find().sort({ code: 1 }).lean()
  return NextResponse.json({
    modules: (modules as Array<Record<string, unknown>>).map((m) => ({
      ...m,
      _id: String(m._id),
      pdfRef: m.pdfRef ? String(m.pdfRef) : '',
    })),
  })
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: '요청 형식 오류' }, { status: 400 }) }
  const doc = normalizeModuleInput(body)
  if (!doc.code || !doc.category || !doc.title) {
    return NextResponse.json({ error: 'code · category · title 은 필수입니다.' }, { status: 400 })
  }
  await connectDB()
  try {
    const created = await CuratorModule.create(doc)
    return NextResponse.json({ success: true, id: String(created._id) })
  } catch (e) {
    const msg = (e as { code?: number }).code === 11000 ? '이미 존재하는 청구기호(code)입니다.' : '생성 실패'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
