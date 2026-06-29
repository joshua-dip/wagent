import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Purchase from "@/models/Purchase";
import Order from "@/models/Order";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { spendPric, refundPric } from "@/lib/pric";

/** 토스 결제 승인 API 호출. */
async function tossConfirm(paymentKey: string, orderId: string, amount: number) {
  const tossSecretKey = process.env.TOSS_SECRET_KEY || 'live_gsk_QbgMGZzorzjKRv65Mjljrl5E1em4';
  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(tossSecretKey + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function POST(request: NextRequest) {
  try {
    // 통합 인증 확인
    const session = await getServerSession(authOptions);
    let currentUser: any = null;

    if (session?.user?.email) {
      currentUser = session.user;
    } else {
      const cookieStore = await cookies();
      const token = cookieStore.get("wagent-auth")?.value;
      if (token) {
        try {
          currentUser = verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret");
        } catch (error) {
          console.error("JWT 토큰 검증 실패:", error);
        }
      }
    }

    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { paymentKey, orderId, amount, productId } = await request.json();

    if (!paymentKey || !orderId || amount == null) {
      return NextResponse.json({ error: "결제 정보가 올바르지 않습니다." }, { status: 400 });
    }

    await connectDB();
    const userId = currentUser.id || currentUser._id;

    // Idempotency 가드: 같은 paymentKey로 이미 Purchase가 있으면 재호출 없이 기존 데이터 반환.
    const existing = await Purchase.find({ paymentKey }).lean();
    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "결제가 완료되었습니다.",
        purchases: existing.map((p) => ({
          _id: p._id, productId: p.productId, productTitle: p.productTitle,
          amount: p.amount, purchaseDate: p.purchaseDate,
        })),
        ...(existing.length === 1 ? { purchase: {
          _id: existing[0]._id, productId: existing[0].productId, productTitle: existing[0].productTitle,
          amount: existing[0].amount, purchaseDate: existing[0].purchaseDate,
        } } : {}),
      });
    }

    // ── 주문 기반 경로 (장바구니 + 단일상품 통일, 프릭 지원) ──────────────────
    const order = await Order.findOne({ orderId });
    if (order) {
      if (order.status !== 'PENDING') {
        // 이미 확정된 주문 — 기존 구매 반환(멱등)
        const purchases = await Purchase.find({ orderId }).lean();
        return NextResponse.json({
          success: true,
          message: "결제가 완료되었습니다.",
          purchases: purchases.map((p) => ({
            _id: p._id, productId: p.productId, productTitle: p.productTitle,
            amount: p.amount, purchaseDate: p.purchaseDate,
          })),
        });
      }

      const payable = typeof order.payableAmount === 'number' ? order.payableAmount : order.totalAmount;
      const pricUsed = typeof order.pricUsed === 'number' ? order.pricUsed : 0;

      if (payable <= 0) {
        return NextResponse.json({ error: "전액 프릭 결제는 프릭 결제 경로로 처리해야 합니다." }, { status: 400 });
      }
      if (payable !== amount) {
        return NextResponse.json({ error: "결제 금액이 주문 금액과 일치하지 않습니다." }, { status: 400 });
      }

      // 1) 프릭 차감 (원자적). 부족하면 카드 캡처 전이라 안전하게 중단.
      if (pricUsed > 0) {
        const spend = await spendPric(String(userId), pricUsed, { orderId });
        if (!spend.ok) {
          return NextResponse.json({ error: "프릭 잔액이 부족합니다." }, { status: 400 });
        }
      }

      // 2) 토스 승인 (카드 캡처). 실패하면 차감한 프릭 즉시 환불.
      const toss = await tossConfirm(paymentKey, orderId, amount);
      if (!toss.ok) {
        if (pricUsed > 0) await refundPric(String(userId), pricUsed, { orderId, note: 'toss_confirm_failed' });
        return NextResponse.json({ error: toss.data?.message || '결제 승인에 실패했습니다.', code: toss.data?.code }, { status: 400 });
      }

      // 3) 주문 점유 (동시 confirm 경합 방지). 진 쪽은 중복 차감분 환불.
      const claimed = await Order.findOneAndUpdate(
        { orderId, status: 'PENDING' },
        { $set: { status: 'CONFIRMED' } },
        { new: true },
      );
      if (!claimed) {
        if (pricUsed > 0) await refundPric(String(userId), pricUsed, { orderId, note: 'race_lost' });
        const purchases = await Purchase.find({ orderId }).lean();
        return NextResponse.json({
          success: true,
          message: "결제가 완료되었습니다.",
          purchases: purchases.map((p) => ({
            _id: p._id, productId: p.productId, productTitle: p.productTitle,
            amount: p.amount, purchaseDate: p.purchaseDate,
          })),
        });
      }

      // 4) 구매 레코드 생성
      const purchases = [];
      for (const item of claimed.cartItems) {
        const purchase = await Purchase.create({
          userId,
          userEmail: currentUser.email,
          productId: item.productId,
          productTitle: item.title,
          amount: item.price,
          paymentKey,
          orderId,
          paymentMethod: toss.data.method || 'CARD',
          paymentStatus: 'COMPLETED',
          purchaseDate: new Date(),
          tossPaymentData: toss.data,
        });
        purchases.push({
          _id: purchase._id, productId: purchase.productId, productTitle: purchase.productTitle,
          amount: purchase.amount, purchaseDate: purchase.purchaseDate,
        });
      }

      return NextResponse.json({
        success: true,
        message: "결제가 완료되었습니다.",
        pricUsed,
        purchases,
        ...(purchases.length === 1 ? { purchase: purchases[0] } : {}),
      });
    }

    // ── 레거시 단일상품 경로 (주문 없음, 프릭 미사용) ─────────────────────────
    const toss = await tossConfirm(paymentKey, orderId, amount);
    if (!toss.ok) {
      return NextResponse.json({ error: toss.data?.message || '결제 승인에 실패했습니다.', code: toss.data?.code }, { status: 400 });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    const purchase = await Purchase.create({
      userId,
      userEmail: currentUser.email,
      productId: product._id,
      productTitle: product.title,
      amount,
      paymentKey,
      orderId,
      paymentMethod: toss.data.method || 'CARD',
      paymentStatus: 'COMPLETED',
      purchaseDate: new Date(),
      tossPaymentData: toss.data,
    });

    return NextResponse.json({
      success: true,
      message: "결제가 완료되었습니다.",
      purchase: {
        _id: purchase._id, productId: purchase.productId, productTitle: purchase.productTitle,
        amount: purchase.amount, purchaseDate: purchase.purchaseDate,
      },
    });

  } catch (error) {
    console.error("결제 승인 오류 상세:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({
      error: error instanceof Error ? error.message : "결제 승인 중 오류가 발생했습니다.",
    }, { status: 500 });
  }
}
