import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // ObjectId 유효성 검사
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    }

    // 상품 조회
    const product = await Product.findOne({ 
      _id: id, 
      isActive: true 
    }).lean();

    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ product });

  } catch (error) {
    console.error("상품 상세 조회 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "상품 정보를 불러오는 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}