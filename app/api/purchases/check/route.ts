import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import { Types } from "mongoose";

// 특정 상품 구매 여부 확인
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ hasPurchased: false });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId || !Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    }

    await connectDB();

    const purchase = await Purchase.findOne({
      userId: session.user.email,
      productId,
      paymentStatus: 'completed',
      isActive: true
    });

    return NextResponse.json({ 
      hasPurchased: !!purchase,
      purchase: purchase ? {
        id: purchase._id,
        downloadCount: purchase.downloadCount,
        maxDownloads: purchase.maxDownloads,
        purchaseDate: purchase.purchaseDate,
        lastDownloadDate: purchase.lastDownloadDate
      } : null
    });

  } catch (error) {
    console.error("구매 확인 오류:", error);
    return NextResponse.json({ error: "구매 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}