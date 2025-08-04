import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const isFree = searchParams.get('free'); // 무료 상품 필터
    const search = searchParams.get('search');

    // 필터 조건 구성
    const filter: any = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (isFree === 'true') {
      filter.price = 0; // 무료 상품만
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    // 상품 조회
    const products = await Product.find(filter)
      .select('title description price originalPrice category tags author createdAt fileSize downloadCount rating reviewCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 전체 개수 조회
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        category,
        isFree: isFree === 'true',
        search
      }
    });

  } catch (error) {
    console.error("상품 목록 조회 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "상품 목록을 불러오는 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}