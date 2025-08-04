import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { emailCheckSchema } from '@/utils/signupValidation'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // 유효성 검사
    const validationResult = emailCheckSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '올바른 이메일 형식이 아닙니다',
          available: false
        },
        { status: 400 }
      )
    }
    
    const { email } = validationResult.data
    
    // 이메일 중복 체크
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    
    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: '이미 사용 중인 이메일입니다'
      })
    }
    
    return NextResponse.json({
      available: true,
      message: '사용 가능한 이메일입니다'
    })
    
  } catch (error) {
    console.error('이메일 중복 체크 오류:', error)
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다',
        available: false
      },
      { status: 500 }
    )
  }
}