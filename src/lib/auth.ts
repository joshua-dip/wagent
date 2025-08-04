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
          // 관리자 계정만 허용 (MongoDB 의존성 완전 제거)
          if (credentials.email === "wnsbr2898@naver.com" && credentials.password === "123456") {
            console.log('관리자 로그인 성공 (MongoDB 독립)')
            return {
              id: "admin",
              email: "wnsbr2898@naver.com",
              name: "관리자",
            }
          }

          console.log('인증 실패 - 관리자 계정만 허용:', credentials.email)
          return null
        } catch (error) {
          console.error('로그인 오류:', error)
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