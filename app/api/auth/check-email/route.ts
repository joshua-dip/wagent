import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    console.log('이메일 중복체크 API 시작 (간소화 버전)')
    
    const body = await request.json()
    const { email } = body
    
    console.log('이메일 중복체크 요청:', email)
    
    // 간단한 이메일 형식 검사
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { 
          error: '올바른 이메일 형식을 입력해주세요.',
          available: false
        },
        { status: 400 }
      )
    }

    console.log('MongoDB 연결 시도...')
    await connectDB()
    console.log('MongoDB 연결 성공')
    
    // 이메일 중복 체크
    console.log('중복체크 수행:', email.toLowerCase())
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    
    if (existingUser) {
      console.log('이메일 중복 발견:', email)
      return NextResponse.json({
        available: false,
        message: '이미 사용 중인 이메일입니다'
      })
    }
    
    console.log('이메일 사용 가능:', email)
    return NextResponse.json({
      available: true,
      message: '사용 가능한 이메일입니다'
    })
    
  } catch (error) {
    console.error('이메일 중복 체크 오류:', error)
    return NextResponse.json(
      { 
        error: '이메일 중복 체크 중 오류가 발생했습니다.',
        available: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}