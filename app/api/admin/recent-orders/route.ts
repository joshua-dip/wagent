import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Purchase from '@/models/Purchase'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // 최근 10개 주문 가져오기
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // 주문 데이터 포맷팅
    const orders = purchases.map(purchase => ({
      _id: purchase._id.toString(),
      userEmail: purchase.userEmail,
      userName: purchase.userEmail.split('@')[0], // 이메일에서 이름 추출
      totalAmount: purchase.amount,
      status: purchase.status || 'CONFIRMED',
      createdAt: purchase.createdAt,
      itemCount: 1 // 현재는 1개씩
    }))

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('최근 주문 조회 오류:', error)
    return NextResponse.json(
      { error: '주문 내역을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}


