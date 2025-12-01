import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import EmailVerificationToken from '@/models/EmailVerificationToken'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/auth/simple-signin?error=invalid_token', request.url))
    }

    await connectDB()

    // 토큰 찾기
    const verificationToken = await EmailVerificationToken.findOne({ token })

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/auth/simple-signin?error=invalid_token', request.url))
    }

    // 토큰 만료 확인
    if (verificationToken.expiresAt < new Date()) {
      await EmailVerificationToken.deleteOne({ _id: verificationToken._id })
      return NextResponse.redirect(new URL('/auth/simple-signin?error=expired_token', request.url))
    }

    // 사용자 이메일 인증 처리
    await User.findByIdAndUpdate(verificationToken.userId, {
      emailVerified: true,
    })

    // 토큰 삭제
    await EmailVerificationToken.deleteOne({ _id: verificationToken._id })

    // 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/auth/simple-signin?verified=true', request.url))

  } catch (error) {
    console.error('이메일 인증 오류:', error)
    return NextResponse.redirect(new URL('/auth/simple-signin?error=verification_failed', request.url))
  }
}

