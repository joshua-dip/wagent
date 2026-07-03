import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Purchase from '@/models/Purchase'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/adminAuth'
import { tossCancel } from '@/lib/toss'
import { refundPric } from '@/lib/pric'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 주문 환불. Toss 카드 결제 취소 + 사용한 프릭 복원 + 구매 REFUNDED.
 * Body: { reason?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { orderId } = await params
  if (!orderId) return NextResponse.json({ error: 'orderId 필요' }, { status: 400 })

  let reason = '관리자 환불'
  try {
    const body = await request.json()
    if (typeof body?.reason === 'string' && body.reason.trim()) reason = body.reason.trim()
  } catch { /* body 없어도 됨 */ }

  try {
    await connectDB()

    const purchases = await Purchase.find({ orderId })
    if (purchases.length === 0) {
      return NextResponse.json({ error: '해당 주문의 구매 내역이 없습니다.' }, { status: 404 })
    }
    if (purchases.every((p) => p.paymentStatus === 'REFUNDED')) {
      return NextResponse.json({ success: true, alreadyRefunded: true, message: '이미 환불된 주문입니다.' })
    }

    const order = await Order.findOne({ orderId })
    const paymentKey = purchases.find((p) => p.paymentKey)?.paymentKey as string | undefined
    const userId = String(order?.userId || purchases[0].userId)
    const pricUsed = typeof order?.pricUsed === 'number' ? order.pricUsed : 0
    const refundedAmount = purchases.reduce((s, p) => s + (p.amount || 0), 0)

    // 1) 카드 결제가 있으면 Toss 취소
    if (paymentKey) {
      const cancel = await tossCancel(paymentKey, reason)
      if (!cancel.ok) {
        return NextResponse.json(
          { error: `카드 결제 취소 실패: ${cancel.data?.message || '알 수 없음'}`, code: cancel.data?.code },
          { status: 400 },
        )
      }
    }

    // 2) 사용한 프릭 복원
    let pricRestored = 0
    if (pricUsed > 0) {
      await refundPric(userId, pricUsed, { orderId, note: 'order_refund' })
      pricRestored = pricUsed
    }

    // 3) 구매 REFUNDED 처리 (다운로드 차단)
    await Purchase.updateMany({ orderId }, { $set: { paymentStatus: 'REFUNDED', isActive: false } })

    return NextResponse.json({
      success: true,
      refundedAmount, // 정가 기준 환불 상품 금액
      cardCanceled: !!paymentKey,
      pricRestored,
      message: `환불 완료${paymentKey ? ' (카드 취소)' : ''}${pricRestored > 0 ? ` · 프릭 ${pricRestored.toLocaleString()} 복원` : ''}`,
    })
  } catch (e) {
    console.error('주문 환불 오류:', e)
    return NextResponse.json({ error: '환불 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
