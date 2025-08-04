import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";
import { generateSecureDownloadUrl } from "@/lib/s3Config";
import { Types } from "mongoose";

interface RouteContext {
  params: Promise<{ productId: string }>
}

// S3 보안 다운로드
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const params = await context.params;
    const { productId } = params;

    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    }

    await connectDB();

    // 구매 확인
    const purchase = await Purchase.findOne({
      userId: session.user.email,
      productId,
      paymentStatus: 'completed',
      isActive: true
    });

    if (!purchase) {
      return NextResponse.json({ error: "구매하지 않은 상품입니다." }, { status: 403 });
    }

    // 다운로드 횟수 확인
    if (purchase.downloadCount >= purchase.maxDownloads) {
      return NextResponse.json({ 
        error: `다운로드 제한 횟수(${purchase.maxDownloads}회)를 초과했습니다.` 
      }, { status: 403 });
    }

    // 상품 정보 조회
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    try {
      // S3에서 보안 다운로드 URL 생성 (1시간 유효)
      const downloadUrl = await generateSecureDownloadUrl(product.filePath);
      
      // 다운로드 카운트 업데이트
      await Promise.all([
        Purchase.findByIdAndUpdate(purchase._id, {
          $inc: { downloadCount: 1 },
          lastDownloadDate: new Date()
        }),
        Product.findByIdAndUpdate(productId, {
          $inc: { downloadCount: 1 }
        })
      ]);

      // 보안 URL로 리다이렉트
      return NextResponse.json({
        success: true,
        downloadUrl: downloadUrl,
        fileName: product.originalFileName,
        message: "다운로드 링크가 생성되었습니다. (1시간 유효)"
      });

    } catch (s3Error) {
      console.error("S3 다운로드 URL 생성 오류:", s3Error);
      return NextResponse.json({ error: "파일 다운로드 링크 생성 중 오류가 발생했습니다." }, { status: 500 });
    }

  } catch (error) {
    console.error("다운로드 처리 오류:", error);
    return NextResponse.json({ error: "다운로드 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}