import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import PricLedger from '@/models/PricLedger'
import { requireAdmin } from '@/lib/adminAuth'
import { adminAdjustPric, getUserPric } from '@/lib/pric'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 프릭 지급(+)/회수(-) — body { delta: number, note?: string } */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { id } = await params
  let body: { delta?: unknown; note?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '요청 형식 오류' }, { status: 400 })
  }

  const delta = Math.trunc(Number(body?.delta))
  if (!Number.isFinite(delta) || delta === 0) {
    return NextResponse.json({ error: '지급(+)/회수(-)할 프릭(0이 아닌 정수)을 입력하세요.' }, { status: 400 })
  }
  const note = typeof body?.note === 'string' ? body.note.trim() : undefined

  const res = await adminAdjustPric(id, delta, { note, adminEmail: gate.admin.email })
  if (!res) {
    return NextResponse.json({ error: '사용자를 찾을 수 없거나 변경할 수 없습니다.' }, { status: 404 })
  }
  return NextResponse.json({ success: true, balanceAfter: res.balanceAfter, delta: res.delta })
}

/** 잔액 + 최근 거래내역 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { id } = await params
  await connectDB()
  const balance = await getUserPric(id)
  const ledger = await PricLedger.find({ userId: id })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean()
  return NextResponse.json({
    balance,
    ledger: (ledger as unknown as Array<{ _id: unknown; delta: number; balanceAfter: number; kind: string; meta?: Record<string, unknown>; createdAt: Date }>).map((l) => ({
      id: String(l._id),
      delta: l.delta,
      balanceAfter: l.balanceAfter,
      kind: l.kind,
      meta: l.meta ?? {},
      createdAt: l.createdAt,
    })),
  })
}
