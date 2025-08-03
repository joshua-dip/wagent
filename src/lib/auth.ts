import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"

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

        // 데모 계정들
        const demoAccounts = [
          {
            email: "admin@wagent.com",
            password: "admin123",
            id: "1",
            name: "관리자",
            role: "admin"
          },
          {
            email: "test@wagent.com", 
            password: "test123",
            id: "2",
            name: "테스트 사용자",
            role: "user"
          }
        ]

        const user = demoAccounts.find(
          account => account.email === credentials.email && account.password === credentials.password
        )

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        }

        return null
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