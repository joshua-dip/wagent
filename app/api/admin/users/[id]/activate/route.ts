import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const { id } = params

    // 사용자 활성화
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '사용자가 활성화되었습니다.',
      user
    })

  } catch (error) {
    console.error('사용자 활성화 오류:', error)
    return NextResponse.json(
      { error: '사용자 활성화에 실패했습니다.' },
      { status: 500 }
    )
  }
}


