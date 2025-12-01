import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || ''
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || ''

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('카카오 로그인 에러:', error)
      return NextResponse.redirect(new URL('/auth/simple-signin?error=kakao_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/auth/simple-signin?error=no_code', request.url))
    }

    // 동적으로 Redirect URI 생성 (환경에 따라 자동 설정)
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || request.url
    const KAKAO_REDIRECT_URI = `${protocol}://${host}/api/auth/kakao/callback`
    
    console.log('카카오 Redirect URI:', KAKAO_REDIRECT_URI)

    // 1. 카카오 액세스 토큰 받기
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        client_secret: KAKAO_CLIENT_SECRET,
        redirect_uri: KAKAO_REDIRECT_URI,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('카카오 토큰 에러:', tokenData)
      return NextResponse.redirect(new URL('/auth/simple-signin?error=token_failed', request.url))
    }

    const { access_token } = tokenData

    // 2. 카카오 사용자 정보 가져오기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const kakaoUser = await userResponse.json()

    if (!userResponse.ok) {
      console.error('카카오 사용자 정보 에러:', kakaoUser)
      return NextResponse.redirect(new URL('/auth/simple-signin?error=user_info_failed', request.url))
    }

    // 3. DB 연결
    await connectDB()

    // 4. 사용자 찾기 또는 생성
    let user = await User.findOne({ kakaoId: kakaoUser.id.toString() })

    if (!user) {
      // 새 사용자 생성
      const email = kakaoUser.kakao_account?.email || `kakao_${kakaoUser.id}@kakao.user`
      const name = kakaoUser.kakao_account?.profile?.nickname || '카카오 사용자'

      user = await User.create({
        email,
        name,
        kakaoId: kakaoUser.id.toString(),
        signupMethod: 'kakao',
        password: 'KAKAO_LOGIN', // 카카오 로그인은 비밀번호 불필요
        termsAgreed: true, // 카카오 로그인 시 동의한 것으로 간주
        privacyAgreed: true, // 카카오 로그인 시 동의한 것으로 간주
        emailVerified: kakaoUser.kakao_account?.email ? true : false, // 이메일이 있으면 인증된 것으로 간주
      })
    }

    // 5. JWT 토큰 생성 (기존 시스템과 동일한 방식)
    const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'simple-auth-secret-key'
    
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 6. 쿠키 설정 및 리다이렉트 (기존 시스템과 동일한 쿠키 이름 사용)
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('wagent-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return response

  } catch (error) {
    console.error('카카오 로그인 처리 중 오류:', error)
    return NextResponse.redirect(new URL('/auth/simple-signin?error=server_error', request.url))
  }
}

