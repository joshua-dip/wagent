import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";
import { Types } from "mongoose";

// 구매 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { productId, paymentMethod } = body;

    // 유효성 검사
    if (!productId || !paymentMethod) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    }

    // 상품 정보 조회
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    // 이미 구매했는지 확인
    const existingPurchase = await Purchase.findOne({
      userId: session.user.email,
      productId,
      paymentStatus: 'completed'
    });

    if (existingPurchase) {
      return NextResponse.json({ error: "이미 구매한 상품입니다." }, { status: 400 });
    }

    // 구매 기록 생성
    const purchase = new Purchase({
      userId: session.user.email,
      userEmail: session.user.email,
      productId,
      productTitle: product.title,
      productPrice: product.price,
      downloadCount: 0,
      maxDownloads: 5,
      paymentMethod,
      paymentStatus: 'completed', // 테스트용으로 즉시 완료 처리
      transactionId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isActive: true
    });

    await purchase.save();

    // 상품의 다운로드 카운트는 실제 다운로드 시 증가
    return NextResponse.json({
      message: "구매가 완료되었습니다.",
      purchase: {
        id: purchase._id,
        productTitle: purchase.productTitle,
        productPrice: purchase.productPrice,
        purchaseDate: purchase.purchaseDate
      }
    }, { status: 201 });

  } catch (error) {
    console.error("구매 처리 오류:", error);
    return NextResponse.json({ error: "구매 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 사용자 구매 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const purchases = await Purchase.find({
      userId: session.user.email,
      paymentStatus: 'completed',
      isActive: true
    })
    .populate('productId', 'title description category author fileSize isActive')
    .sort({ purchaseDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await Purchase.countDocuments({
      userId: session.user.email,
      paymentStatus: 'completed',
      isActive: true
    });

    const totalPages = Math.ceil(total / limit);

    // 상품이 삭제된 구매는 필터링
    const validPurchases = purchases.filter(purchase => 
      purchase.productId && (purchase.productId as any).isActive
    );

    return NextResponse.json({
      purchases: validPurchases,
      pagination: {
        page,
        limit,
        total: validPurchases.length,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("구매 목록 조회 오류:", error);
    return NextResponse.json({ error: "구매 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}