import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Purchase from "@/models/Purchase";
import Order from "@/models/Order";
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

    const { paymentKey, orderId, amount, productId, isCart } = await request.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ 
        error: "결제 정보가 올바르지 않습니다." 
      }, { status: 400 });
    }

    await connectDB();

    // 토스페이먼츠 결제 승인 API 호출
    // AWS Amplify 환경 변수 이슈로 인한 fallback 값 사용
    const tossSecretKey = process.env.TOSS_SECRET_KEY || 'live_gsk_QbgMGZzorzjKRv65Mjljrl5E1em4';
    
    console.log('결제 승인 시작:', { 
      orderId, 
      amount, 
      productId, 
      isCart,
      hasSecretKey: !!tossSecretKey,
      usingFallback: !process.env.TOSS_SECRET_KEY
    });
    
    if (!tossSecretKey) {
      console.error("TOSS_SECRET_KEY가 설정되지 않았습니다.");
      return NextResponse.json({ 
        error: "결제 시스템 설정 오류입니다." 
      }, { status: 500 });
    }

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(tossSecretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const tossData = await tossResponse.json();
    
    console.log('Toss Payments API 응답:', { 
      status: tossResponse.status, 
      ok: tossResponse.ok,
      data: tossData 
    });

    if (!tossResponse.ok) {
      console.error('토스페이먼츠 승인 실패:', tossData);
      return NextResponse.json({ 
        error: tossData.message || '결제 승인에 실패했습니다.',
        code: tossData.code
      }, { status: 400 });
    }

    // 장바구니 결제인 경우
    if (isCart) {
      // orderId로 주문 정보 조회
      const order = await Order.findOne({ orderId, status: 'PENDING' });
      
      if (!order) {
        return NextResponse.json({ 
          error: "주문 정보를 찾을 수 없거나 만료되었습니다." 
        }, { status: 404 });
      }

      // 주문 금액 검증
      if (order.totalAmount !== amount) {
        return NextResponse.json({ 
          error: "결제 금액이 주문 금액과 일치하지 않습니다." 
        }, { status: 400 });
      }

      // 각 상품마다 Purchase 레코드 생성
      const purchases = [];
      for (const item of order.cartItems) {
        const purchase = await Purchase.create({
          userId: currentUser.id || currentUser._id,
          userEmail: currentUser.email,
          productId: item.productId,
          productTitle: item.title,
          amount: item.price,
          paymentKey: paymentKey,
          orderId: orderId,
          paymentMethod: tossData.method || 'CARD',
          paymentStatus: 'COMPLETED',
          purchaseDate: new Date(),
          tossPaymentData: tossData,
        });

        purchases.push({
          _id: purchase._id,
          productId: purchase.productId,
          productTitle: purchase.productTitle,
          amount: purchase.amount,
          purchaseDate: purchase.purchaseDate,
        });
      }

      // 주문 상태 업데이트
      order.status = 'CONFIRMED';
      await order.save();

      return NextResponse.json({
        success: true,
        message: "결제가 완료되었습니다.",
        purchases: purchases
      });
    }

    // 단일 상품 결제인 경우
    const product = await Product.findOne({ 
      _id: productId, 
      isActive: true 
    });

    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    // 구매 내역 저장
    const purchase = await Purchase.create({
      userId: currentUser.id || currentUser._id,
      userEmail: currentUser.email,
      productId: product._id,
      productTitle: product.title,
      amount: amount,
      paymentKey: paymentKey,
      orderId: orderId,
      paymentMethod: tossData.method || 'CARD',
      paymentStatus: 'COMPLETED',
      purchaseDate: new Date(),
      tossPaymentData: tossData,
    });

    return NextResponse.json({
      success: true,
      message: "결제가 완료되었습니다.",
      purchase: {
        _id: purchase._id,
        productId: purchase.productId,
        productTitle: purchase.productTitle,
        amount: purchase.amount,
        purchaseDate: purchase.purchaseDate,
      }
    });

  } catch (error) {
    console.error("결제 승인 오류 상세:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "결제 승인 중 오류가 발생했습니다.",
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
    }, { status: 500 });
  }
}

