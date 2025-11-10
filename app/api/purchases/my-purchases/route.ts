import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export async function GET(request: NextRequest) {
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

    await connectDB();

    // 사용자의 모든 구매 내역 조회
    const purchases = await Purchase.find({
      userEmail: currentUser.email,
      paymentStatus: 'COMPLETED'
    })
    .sort({ purchaseDate: -1 })
    .lean();

    return NextResponse.json({
      success: true,
      purchases: purchases.map(p => ({
        _id: p._id.toString(),
        productId: p.productId?.toString() || '',
        productTitle: p.productTitle,
        amount: p.amount,
        purchaseDate: p.purchaseDate,
        downloadCount: p.downloadCount,
        maxDownloads: p.maxDownloads,
        paymentMethod: p.paymentMethod,
        paymentStatus: p.paymentStatus
      }))
    });

  } catch (error) {
    console.error("구매 내역 조회 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "구매 내역 조회 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}

