import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ObjectId } from 'mongodb';
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

    const { productId } = await request.json();

    if (!productId || !ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    }

    await connectDB();

    // 상품 조회
    const product = await Product.findOne({ 
      _id: productId, 
      isActive: true 
    });

    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    // 무료 상품인 경우
    if (product.price === 0) {
      return NextResponse.json({ 
        error: "무료 상품은 결제가 필요하지 않습니다." 
      }, { status: 400 });
    }

    // 주문 ID 생성 (orderId는 고유해야 함)
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 결제 요청 정보 생성
    const paymentData = {
      orderId,
      orderName: product.title,
      amount: product.price,
      customerEmail: currentUser.email,
      customerName: currentUser.name || '고객',
      productId: product._id.toString(),
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      failUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/fail`,
    };

    return NextResponse.json({
      success: true,
      paymentData,
      clientKey: process.env.TOSS_CLIENT_KEY || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    });

  } catch (error) {
    console.error("결제 요청 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "결제 요청 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}

