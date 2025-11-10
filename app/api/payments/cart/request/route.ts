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

    const { cartItems } = await request.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "장바구니가 비어있습니다." }, { status: 400 });
    }

    await connectDB();

    // 상품 ID 검증 및 조회
    const productIds = cartItems.map((item: any) => item.productId);
    const invalidIds = productIds.filter((id: string) => !ObjectId.isValid(id));
    
    if (invalidIds.length > 0) {
      return NextResponse.json({ error: "유효하지 않은 상품 ID가 포함되어 있습니다." }, { status: 400 });
    }

    // DB에서 상품 정보 조회
    const products = await Product.find({
      _id: { $in: productIds.map((id: string) => new ObjectId(id)) },
      isActive: true
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "일부 상품을 찾을 수 없습니다." }, { status: 404 });
    }

    // 무료 상품 체크
    const hasFreeProduct = products.some((p) => p.price === 0);
    if (hasFreeProduct) {
      return NextResponse.json({ 
        error: "무료 상품은 결제가 필요하지 않습니다." 
      }, { status: 400 });
    }

    // 총 금액 계산
    const totalAmount = products.reduce((sum, product) => sum + product.price, 0);

    // 주문명 생성
    const orderName = products.length === 1
      ? products[0].title
      : `${products[0].title} 외 ${products.length - 1}건`;

    // 주문 ID 생성 (orderId는 고유해야 함)
    const orderId = `CART_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 결제 요청 정보 생성
    const paymentData = {
      orderId,
      orderName,
      amount: totalAmount,
      customerEmail: currentUser.email,
      customerName: currentUser.name || '고객',
      productIds: productIds,
      products: products.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        price: p.price,
        category: p.category,
      })),
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?isCart=true`,
      failUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/fail`,
    };

    return NextResponse.json({
      success: true,
      paymentData,
      clientKey: process.env.TOSS_CLIENT_KEY || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    });

  } catch (error) {
    console.error("장바구니 결제 요청 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "결제 요청 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}

