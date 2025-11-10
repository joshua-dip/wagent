import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

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

    const { orderId, cartItems, totalAmount } = await request.json();

    if (!orderId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "주문 정보가 올바르지 않습니다." }, { status: 400 });
    }

    await connectDB();

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
        userId: currentUser.id || currentUser._id,
        userEmail: currentUser.email,
        cartItems: cartItems.map((item: any) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          category: item.category
        })),
        totalAmount,
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

