import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Purchase from '@/models/Purchase'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // 모든 사용자 가져오기
    const users = await User.find()
      .select('-password') // 비밀번호 제외
      .sort({ createdAt: -1 })
      .lean()

    // 각 사용자의 구매 정보 추가
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const purchases = await Purchase.find({ userEmail: user.email })
        
        return {
          ...user,
          _id: user._id.toString(),
          purchaseCount: purchases.length,
          totalSpent: purchases.reduce((sum, p) => sum + (p.amount || 0), 0)
        }
      })
    )

    return NextResponse.json({ users: usersWithStats })

  } catch (error) {
    console.error('사용자 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '사용자 목록을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}


