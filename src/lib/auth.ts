import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import connectDB from "@/lib/db"
import User from "@/models/User"

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI가 설정되지 않았습니다')
}

const client = new MongoClient(process.env.MONGODB_URI)
const clientPromise = client.connect()

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  trustHost: true,
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
          await connectDB()
          
          // 먼저 DB에서 사용자 찾기
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase(),
            isActive: true 
          })
          
          if (user && await user.comparePassword(credentials.password)) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
            }
          }

          // DB에 없으면 관리자 계정으로 폴백
          if (credentials.email === "wnsbr2898@naver.com" && credentials.password === "123456") {
            return {
              id: "wnsbr2898@naver.com",
              email: "wnsbr2898@naver.com",
              name: "관리자",
            }
          }

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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    // signUp: "/auth/signup",
  },
}