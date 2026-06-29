import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import Order from "@/models/Order";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { spendPric } from "@/lib/pric";

/**
 * 전액 프릭 결제 (payable === 0). Toss 없이 프릭만으로 주문 확정.
 * Body: { orderId }
 *
 * 멱등: 주문을 PENDING→CONFIRMED 로 원자적 점유한 호출만 차감·구매생성.
 */
export async function POST(request: NextRequest) {
  try {
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
        } catch {
          currentUser = null;
        }
      }
    }
    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "주문 정보가 올바르지 않습니다." }, { status: 400 });
    }

    await connectDB();
    const userId = String(currentUser.id || currentUser._id);

    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없거나 만료되었습니다." }, { status: 404 });
    }
    if (String(order.userId) !== userId) {
      return NextResponse.json({ error: "본인 주문만 결제할 수 있습니다." }, { status: 403 });
    }

    const payable = typeof order.payableAmount === 'number' ? order.payableAmount : order.totalAmount;
    const pricUsed = typeof order.pricUsed === 'number' ? order.pricUsed : 0;

    // 이미 확정된 주문 → 멱등 반환
    if (order.status === 'CONFIRMED') {
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

    if (payable > 0) {
      return NextResponse.json({ error: "전액 프릭 결제 대상이 아닙니다. (카드 결제 필요)" }, { status: 400 });
    }
    if (pricUsed <= 0) {
      return NextResponse.json({ error: "사용할 프릭이 없습니다." }, { status: 400 });
    }

    // 원자적 점유 — 한 호출만 확정 진행
    const claimed = await Order.findOneAndUpdate(
      { orderId, status: 'PENDING' },
      { $set: { status: 'CONFIRMED' } },
      { new: true },
    );
    if (!claimed) {
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

    // 프릭 차감 (원자적). 부족하면 점유 되돌리고 실패.
    const spend = await spendPric(userId, pricUsed, { orderId, note: 'pric_only' });
    if (!spend.ok) {
      await Order.updateOne({ orderId, status: 'CONFIRMED' }, { $set: { status: 'PENDING' } });
      return NextResponse.json({ error: "프릭 잔액이 부족합니다." }, { status: 400 });
    }

    // 구매 레코드 생성
    const purchases = [];
    for (const item of claimed.cartItems) {
      const purchase = await Purchase.create({
        userId,
        userEmail: currentUser.email,
        productId: item.productId,
        productTitle: item.title,
        amount: item.price,
        orderId,
        paymentMethod: 'PRIC',
        paymentStatus: 'COMPLETED',
        purchaseDate: new Date(),
      });
      purchases.push({
        _id: purchase._id, productId: purchase.productId, productTitle: purchase.productTitle,
        amount: purchase.amount, purchaseDate: purchase.purchaseDate,
      });
    }

    return NextResponse.json({
      success: true,
      message: "프릭으로 결제가 완료되었습니다.",
      pricUsed,
      balanceAfter: spend.balanceAfter,
      purchases,
    });

  } catch (error) {
    console.error("프릭 결제 오류:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "프릭 결제 중 오류가 발생했습니다.",
    }, { status: 500 });
  }
}
