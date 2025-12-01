import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import EmailVerificationToken from '@/models/EmailVerificationToken'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: '이메일과 인증번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    await connectDB()

    // 인증 토큰 찾기
    const verificationToken = await EmailVerificationToken.findOne({ 
      email: email.toLowerCase() 
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: '인증번호가 만료되었거나 존재하지 않습니다. 다시 시도해주세요.' },
        { status: 404 }
      )
    }

    // 시도 횟수 확인 (최대 5회)
    if (verificationToken.attempts >= 5) {
      await EmailVerificationToken.deleteOne({ _id: verificationToken._id })
      return NextResponse.json(
        { error: '인증 시도 횟수를 초과했습니다. 다시 회원가입해주세요.' },
        { status: 429 }
      )
    }

    // 만료 확인
    if (verificationToken.expiresAt < new Date()) {
      await EmailVerificationToken.deleteOne({ _id: verificationToken._id })
      return NextResponse.json(
        { error: '인증번호가 만료되었습니다. 다시 회원가입해주세요.' },
        { status: 410 }
      )
    }

    // 인증번호 확인
    if (verificationToken.code !== code) {
      // 시도 횟수 증가
      verificationToken.attempts += 1
      await verificationToken.save()
      
      return NextResponse.json(
        { 
          error: `인증번호가 일치하지 않습니다. (${verificationToken.attempts}/5)`,
          remainingAttempts: 5 - verificationToken.attempts
        },
        { status: 400 }
      )
    }

    // 인증 성공 - 사용자 이메일 인증 처리
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    user.emailVerified = true
    await user.save()

    // 인증 토큰 삭제
    await EmailVerificationToken.deleteOne({ _id: verificationToken._id })

    return NextResponse.json({
      success: true,
      message: '이메일 인증이 완료되었습니다! 로그인해주세요.',
      user: {
        email: user.email,
        name: user.name,
        emailVerified: true
      }
    })

  } catch (error) {
    console.error('인증번호 확인 오류:', error)
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


