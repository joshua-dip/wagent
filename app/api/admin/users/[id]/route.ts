import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Purchase from '@/models/Purchase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const { id } = params

    // 사용자 조회
    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 관리자는 삭제 불가
    if (user.email === 'wnsrb2898@naver.com') {
      return NextResponse.json(
        { error: '관리자 계정은 삭제할 수 없습니다.' },
        { status: 403 }
      )
    }

    // 사용자 구매 내역도 함께 삭제 (선택사항)
    // await Purchase.deleteMany({ userEmail: user.email })

    // 사용자 삭제
    await User.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다.'
    })

  } catch (error) {
    console.error('사용자 삭제 오류:', error)
    return NextResponse.json(
      { error: '사용자 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}


