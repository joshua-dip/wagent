import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PricCharge from "@/models/PricCharge";
import { getAuthUser } from "@/lib/authUser";
import { creditPricCharge, getUserPric } from "@/lib/pric";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function tossConfirm(paymentKey: string, orderId: string, amount: number) {
  const key = process.env.TOSS_SECRET_KEY || 'live_gsk_QbgMGZzorzjKRv65Mjljrl5E1em4';
  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(key + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  return { ok: res.ok, data: await res.json() };
}

/** 프릭 충전 결제 승인 → 프릭 적립. Body: { paymentKey, orderId, amount } */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  let body: { paymentKey?: string; orderId?: string; amount?: number };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "결제 정보가 올바르지 않습니다." }, { status: 400 });
  }
  const { paymentKey, orderId } = body;
  const amount = Number(body.amount);
  if (!paymentKey || !orderId || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "결제 정보가 올바르지 않습니다." }, { status: 400 });
  }

  try {
    await connectDB();
    const charge = await PricCharge.findOne({ orderId });
    if (!charge) return NextResponse.json({ error: "충전 주문을 찾을 수 없거나 만료되었습니다." }, { status: 404 });
    if (String(charge.userId) !== user.id) return NextResponse.json({ error: "본인 주문만 결제할 수 있습니다." }, { status: 403 });

    // 이미 완료 → 멱등 반환
    if (charge.status === 'CONFIRMED') {
      return NextResponse.json({ success: true, alreadyDone: true, charged: charge.amount, balance: await getUserPric(user.id) });
    }
    if (charge.amount !== amount) {
      return NextResponse.json({ error: "결제 금액이 충전 금액과 일치하지 않습니다." }, { status: 400 });
    }

    // 토스 승인 (카드 캡처)
    const toss = await tossConfirm(paymentKey, orderId, amount);
    if (!toss.ok) {
      return NextResponse.json({ error: toss.data?.message || '결제 승인에 실패했습니다.', code: toss.data?.code }, { status: 400 });
    }

    // 원자적 점유 — 한 번만 적립
    const claimed = await PricCharge.findOneAndUpdate(
      { orderId, status: 'PENDING' },
      { $set: { status: 'CONFIRMED', paymentKey } },
      { new: true },
    );
    if (!claimed) {
      return NextResponse.json({ success: true, alreadyDone: true, charged: charge.amount, balance: await getUserPric(user.id) });
    }

    const res = await creditPricCharge(user.id, claimed.amount, { orderId, paymentKey, userEmail: user.email });
    return NextResponse.json({
      success: true,
      charged: claimed.amount,
      balance: res?.balanceAfter ?? (await getUserPric(user.id)),
      message: `${claimed.amount.toLocaleString()} 프릭이 충전되었습니다.`,
    });
  } catch (e) {
    console.error('프릭 충전 승인 오류:', e);
    return NextResponse.json({ error: "충전 승인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
