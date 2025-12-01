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

// 상품 수정 (PATCH)
export async function PATCH(
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

    const body = await request.json();
    
    // 업데이트할 필드만 추출
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.author !== undefined) updateData.author = body.author;

    // 상품 업데이트
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "상품이 수정되었습니다.",
      product 
    });

  } catch (error) {
    console.error("상품 수정 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "상품 수정 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}

// 상품 삭제 (DELETE)
export async function DELETE(
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

    // 상품 삭제
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "상품이 삭제되었습니다.",
      deletedProduct: product
    });

  } catch (error) {
    console.error("상품 삭제 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "상품 삭제 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}