import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { getUserPric } from "@/lib/pric";

export async function POST(request: NextRequest) {
  try {
    // 통합 인증 확인
    const session = await getServerSession(authOptions);
    let currentUser = null;
    
    if (session?.user?.email) {
      currentUser = session.user;
    } else {
      const cookieStore = await cookies();
      const token = cookieStore.get("wagent-auth")?.value;
      
      if (token) {
        try {
          const decoded = verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any;
          currentUser = decoded;
        } catch (error) {
          console.error("JWT 토큰 검증 실패:", error);
        }
      }
    }

    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { orderId, cartItems, totalAmount, pricUsed: pricUsedRaw } = await request.json();

    if (!orderId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "주문 정보가 올바르지 않습니다." }, { status: 400 });
    }

    await connectDB();

    // 프릭 사용액 검증 — 0 ~ min(잔액, 결제총액). 차감은 결제 승인 시점에 원자적으로.
    const userId = currentUser.id || currentUser._id;
    let pricUsed = Math.trunc(Number(pricUsedRaw) || 0);
    if (!Number.isFinite(pricUsed) || pricUsed < 0) pricUsed = 0;
    pricUsed = Math.min(pricUsed, Math.max(0, Math.trunc(Number(totalAmount) || 0)));
    if (pricUsed > 0) {
      const balance = await getUserPric(String(userId));
      if (pricUsed > balance) {
        return NextResponse.json(
          { error: `프릭 잔액이 부족합니다. (보유 ${balance.toLocaleString()} 프릭)` },
          { status: 400 },
        );
      }
    }
    const payableAmount = Math.max(0, (Number(totalAmount) || 0) - pricUsed);

    // 기존에 동일한 orderId가 있는지 확인
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      console.log('중복된 orderId:', orderId);
      return NextResponse.json({ 
        error: "중복된 주문 ID입니다. 페이지를 새로고침해주세요." 
      }, { status: 409 });
    }

    // 주문 정보 저장 (30분 후 만료)
    let order;
    try {
      order = await Order.create({
        orderId,
        userId,
        userEmail: currentUser.email,
        cartItems: cartItems.map((item: any) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          category: item.category
        })),
        totalAmount,
        pricUsed,
        payableAmount,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30분
      });
    } catch (createError: any) {
      // MongoDB 중복 키 오류 (E11000)
      if (createError.code === 11000) {
        console.log('MongoDB 중복 키 오류:', orderId);
        return NextResponse.json({ 
          error: "중복된 주문 ID입니다. 페이지를 새로고침해주세요." 
        }, { status: 409 });
      }
      throw createError;
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        pricUsed: order.pricUsed,
        payableAmount: order.payableAmount,
        requiresPayment: payableAmount > 0,
        itemCount: order.cartItems.length
      }
    });

  } catch (error) {
    console.error("주문 생성 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "주문 생성 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}

