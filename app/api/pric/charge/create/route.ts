import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PricCharge from "@/models/PricCharge";
import { getAuthUser } from "@/lib/authUser";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN = 1000;
const MAX = 1_000_000;

/** 프릭 충전 주문 생성. Body: { orderId, amount(원=프릭) } */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  let body: { orderId?: string; amount?: number };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "요청 형식 오류" }, { status: 400 });
  }

  const orderId = String(body.orderId ?? '').trim();
  const amount = Math.trunc(Number(body.amount));
  if (!orderId) return NextResponse.json({ error: "orderId 필요" }, { status: 400 });
  if (!Number.isFinite(amount) || amount < MIN || amount > MAX) {
    return NextResponse.json(
      { error: `충전 금액은 ${MIN.toLocaleString()}~${MAX.toLocaleString()}원 사이여야 합니다.` },
      { status: 400 },
    );
  }

  try {
    await connectDB();
    const dup = await PricCharge.findOne({ orderId });
    if (dup) return NextResponse.json({ error: "중복된 주문입니다. 새로고침 후 다시 시도하세요." }, { status: 409 });
    await PricCharge.create({ orderId, userId: user.id, userEmail: user.email, amount, status: 'PENDING' });
    return NextResponse.json({ success: true, orderId, amount });
  } catch (e) {
    if ((e as { code?: number })?.code === 11000) {
      return NextResponse.json({ error: "중복된 주문입니다." }, { status: 409 });
    }
    console.error('프릭 충전 주문 생성 오류:', e);
    return NextResponse.json({ error: "주문 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
