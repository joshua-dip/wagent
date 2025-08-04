import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { signupSchema } from '@/utils/signupValidation'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // 유효성 검사
    const validationResult = signupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력값이 올바르지 않습니다',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }
    
    const { email, password, name, nickname, phone, birthDate, gender, marketingAgreed } = validationResult.data
    
    // 이메일 중복 체크
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다' },
        { status: 409 }
      )
    }
    
    // 사용자 생성
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      name,
      nickname: nickname || undefined,
      phone: phone || undefined,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      gender: gender || undefined,
      marketingAgreed,
      termsAgreed: true,
      privacyAgreed: true
    })
    
    await newUser.save()
    
    // 비밀번호 제외하고 응답
    const { password: _, ...userWithoutPassword } = newUser.toJSON()
    
    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다',
        user: userWithoutPassword
      },
      { status: 201 }
    )
    
  } catch (error: any) {
    console.error('회원가입 오류:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다' },
        { status: 409 }
      )
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}