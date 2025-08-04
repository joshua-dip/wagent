import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    console.log('기존 회원가입 API 시작 (간소화 버전)')
    
    const body = await request.json()
    console.log('회원가입 입력 데이터:', { 
      email: body.email, 
      name: body.name, 
      hasPassword: !!body.password,
      fieldsCount: Object.keys(body).length 
    })
    
    // 간단한 필수 필드 검사
    const { email, password, name, nickname, phone, birthDate, gender, marketingAgreed, termsAgreed, privacyAgreed } = body
    
    if (!email || !password || !name) {
      console.log('필수 필드 누락:', { email: !!email, password: !!password, name: !!name })
      return NextResponse.json(
        { error: '이메일, 비밀번호, 이름은 필수 입력 항목입니다.' },
        { status: 400 }
      )
    }

    // 간단한 이메일 형식 검사
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 간단한 비밀번호 길이 검사
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    console.log('MongoDB 연결 시도...')
    await connectDB()
    console.log('MongoDB 연결 성공')
    
    // 이메일 중복 체크
    console.log('이메일 중복 체크:', email.toLowerCase())
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    
    if (existingUser) {
      console.log('이메일 중복:', email)
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      )
    }
    
    // 사용자 생성 (간소화된 필드)
    console.log('새 사용자 생성 중...')
    const newUser = new User({
      email: email.toLowerCase(),
      password: password, // User 모델에서 자동 해시화
      name: name,
      nickname: nickname || undefined,
      phone: phone || undefined,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      gender: gender || undefined,
      marketingAgreed: marketingAgreed || false,
      termsAgreed: true, // 간소화: 항상 true
      privacyAgreed: true, // 간소화: 항상 true
      isActive: true
    })
    
    await newUser.save()
    console.log('사용자 저장 완료:', newUser.email)
    
    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다!',
      user: {
        email: newUser.email,
        name: newUser.name,
        created: true
      }
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('기존 회원가입 오류:', error)
    
    // MongoDB 중복 키 오류
    if (error.code === 11000) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      )
    }

    // Mongoose validation 오류
    if (error.name === 'ValidationError') {
      console.error('Mongoose validation 오류:', error.errors)
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다. 모든 필수 정보를 정확히 입력해주세요.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: '회원가입 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}