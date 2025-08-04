import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";
import { Types } from "mongoose";
import fs from "fs";
import path from "path";

interface RouteContext {
  params: Promise<{ productId: string }>
}

// 파일 다운로드
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

    // 파일 경로 확인
    const filePath = path.join(process.cwd(), product.filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error(`파일을 찾을 수 없음: ${filePath}`);
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }

    try {
      // 파일 읽기
      const fileBuffer = fs.readFileSync(filePath);
      
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

      // 파일 다운로드 응답
      const response = new NextResponse(fileBuffer);
      response.headers.set('Content-Type', 'application/pdf');
      response.headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(product.originalFileName)}"`);
      response.headers.set('Content-Length', fileBuffer.length.toString());

      return response;

    } catch (fileError) {
      console.error("파일 읽기 오류:", fileError);
      return NextResponse.json({ error: "파일 읽기 중 오류가 발생했습니다." }, { status: 500 });
    }

  } catch (error) {
    console.error("다운로드 처리 오류:", error);
    return NextResponse.json({ error: "다운로드 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}