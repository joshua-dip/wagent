import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ObjectId } from 'mongodb';
import { downloadFile, getStorageInfo } from "@/lib/fileStorage";
import { generateSecureDownloadUrl } from "@/lib/s3Config";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 세션 확인 (로그인 필요)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    // ObjectId 유효성 검사
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    }

    // 상품 조회
    const product = await Product.findOne({ 
      _id: id, 
      isActive: true 
    });

    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    // 무료 상품인지 확인
    if (product.price > 0) {
      return NextResponse.json({ 
        error: "유료 상품입니다. 구매 후 다운로드할 수 있습니다." 
      }, { status: 403 });
    }

    // 다운로드 카운트 증가
    await Product.findByIdAndUpdate(id, { 
      $inc: { downloadCount: 1 } 
    });

    const storageInfo = getStorageInfo();

    try {
      if (storageInfo.type === 's3') {
        // S3에서 보안 다운로드 URL 생성
        const downloadUrl = await generateSecureDownloadUrl(product.filePath);
        
        return NextResponse.json({ 
          downloadUrl,
          fileName: product.originalFileName,
          fileSize: product.fileSize,
          storageType: 's3',
          message: "다운로드 링크가 생성되었습니다. (1시간 유효)"
        });
      } else {
        // 로컬 파일 다운로드
        const fileResult = await downloadFile(product.filePath);
        
        if (!fileResult.fileBuffer) {
          return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
        }

        // 파일 다운로드 응답
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(product.originalFileName)}"`);
        headers.set('Content-Length', fileResult.fileBuffer.length.toString());

        return new NextResponse(fileResult.fileBuffer, {
          status: 200,
          headers
        });
      }
    } catch (fileError) {
      console.error("파일 다운로드 오류:", fileError);
      return NextResponse.json({ 
        error: "파일 다운로드 중 오류가 발생했습니다." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("다운로드 API 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "다운로드 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}