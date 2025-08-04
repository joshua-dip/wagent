import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "@/lib/db"
import User from "@/models/User"

export const authOptions: NextAuthOptions = {
  // MongoDBAdapter 제거 (Credentials Provider와 호환성 문제)
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // 먼저 관리자 계정 확인 (빠른 인증)
          if (credentials.email === "wnsbr2898@naver.com" && credentials.password === "123456") {
            console.log('관리자 로그인 성공')
            return {
              id: "admin",
              email: "wnsbr2898@naver.com",
              name: "관리자",
            }
          }

          // DB 연결 후 일반 사용자 확인
          await connectDB()
          console.log('MongoDB 연결 성공')
          
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase(),
            isActive: true 
          })
          
          if (user && await user.comparePassword(credentials.password)) {
            console.log('사용자 로그인 성공:', user.email)
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
            }
          }

          console.log('인증 실패:', credentials.email)
          return null
        } catch (error) {
          console.error('로그인 오류 상세:', error)
          // 에러 발생시에도 관리자 계정은 동작하도록
          if (credentials.email === "wnsbr2898@naver.com" && credentials.password === "123456") {
            console.log('DB 오류 상황에서 관리자 로그인')
            return {
              id: "admin",
              email: "wnsbr2898@naver.com",
              name: "관리자",
            }
          }
          return null
        }
      }
    }),
    // 필요시 소셜 로그인 프로바이더 추가
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: "/auth/signin",
    // signUp: "/auth/signup",
  },
}