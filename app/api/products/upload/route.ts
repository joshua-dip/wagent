import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { createUploadHandler } from "@/lib/multerConfig";
import { promisify } from "util";
import path from "path";

// multer를 Promise로 변환
const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export async function POST(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 관리자 권한 확인 (임시로 특정 이메일만 허용)
    if (session.user.email !== "wnsrb2898@naver.com") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    await connectDB();

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('pdfFile') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const originalPrice = formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : undefined;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;
    const author = formData.get('author') as string;

    // 유효성 검사
    if (!file) {
      return NextResponse.json({ error: "PDF 파일을 선택해주세요." }, { status: 400 });
    }

    if (!title || !description || !price || !category || !author) {
      return NextResponse.json({ error: "모든 필수 필드를 입력해주세요." }, { status: 400 });
    }

    // PDF 파일 확인
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: "PDF 파일만 업로드 가능합니다." }, { status: 400 });
    }

    // 파일 크기 확인 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "파일 크기는 50MB를 초과할 수 없습니다." }, { status: 400 });
    }

    // 파일 저장
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    const safeFileName = `${timestamp}_${nameWithoutExt.replace(/[^a-zA-Z0-9가-힣_-]/g, '_')}${extension}`;
    
    const uploadDir = path.join(process.cwd(), 'uploads', 'products');
    const filePath = path.join(uploadDir, safeFileName);
    
    // 디렉토리 생성
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 파일 저장
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // 태그 처리
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // 제품 정보 데이터베이스 저장
    const product = new Product({
      title,
      description,
      price,
      originalPrice,
      category,
      tags: tagArray,
      author,
      authorId: session.user.email,
      fileName: safeFileName,
      originalFileName: originalName,
      fileSize: file.size,
      filePath: `uploads/products/${safeFileName}`,
      downloadCount: 0,
      rating: 0,
      reviewCount: 0,
      isActive: true
    });

    await product.save();

    return NextResponse.json({ 
      message: "상품이 성공적으로 업로드되었습니다.",
      product: {
        id: product._id,
        title: product.title,
        price: product.price,
        fileName: product.fileName
      }
    }, { status: 201 });

  } catch (error) {
    console.error("파일 업로드 오류:", error);
    return NextResponse.json({ error: "파일 업로드 중 오류가 발생했습니다." }, { status: 500 });
  }
}