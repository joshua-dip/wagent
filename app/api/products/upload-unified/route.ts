import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
// import { uploadFile, getStorageInfo } from "@/lib/fileStorage"; // 제거됨

export async function POST(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 관리자 권한 확인
    if (session.user.email !== "wnsrb2898@naver.com") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    await connectDB();

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;
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

    if (!title || !description || price === null || price === undefined || !category) {
      return NextResponse.json({ error: "모든 필수 필드를 입력해주세요." }, { status: 400 });
    }

    // 작성자가 없으면 기본값 설정
    const finalAuthor = author?.trim() || 'Payperic';

    // PDF 파일 확인
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: "PDF 파일만 업로드 가능합니다." }, { status: 400 });
    }

    // 파일 크기 확인 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "파일 크기는 50MB를 초과할 수 없습니다." }, { status: 400 });
    }

    // 통합 파일 업로드 (환경에 따라 로컬 또는 S3)
    const uploadResult = await uploadFile(file, file.name, file.type);

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
      author: finalAuthor,
      authorId: session.user.email,
      fileName: uploadResult.fileName,
      originalFileName: file.name,
      fileSize: uploadResult.fileSize,
      filePath: uploadResult.filePath,
      downloadCount: 0,
      rating: 0,
      reviewCount: 0,
      isActive: true
    });

    await product.save();

    const storageInfo = getStorageInfo();

    return NextResponse.json({ 
      message: `상품이 성공적으로 업로드되었습니다. (${storageInfo.type.toUpperCase()})`,
      product: {
        id: product._id,
        title: product.title,
        price: product.price,
        fileName: product.fileName,
        storageType: storageInfo.type
      },
      storage: storageInfo
    }, { status: 201 });

  } catch (error) {
    console.error("파일 업로드 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "파일 업로드 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}