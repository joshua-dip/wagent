"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession, signOut } from "next-auth/react"
import { ShoppingBag, Search, User, LogOut, ShoppingCart, Heart, Bell } from "lucide-react"
import Link from "next/link"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-lg">
      <div className="container flex h-20 items-center justify-between px-6">
        {/* 브랜드 로고 */}
        <Link href="/" className="flex items-center space-x-4 group">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WAgent
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block font-medium">Digital Marketplace</p>
          </div>
        </Link>

        {/* 검색바 (중간) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="어떤 자료를 찾고 계신가요? 💡"
              className="pl-12 pr-6 h-12 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 rounded-2xl focus:bg-white focus:shadow-lg focus:border-blue-300 transition-all duration-300 text-base"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
              Ctrl+K
            </div>
          </div>
        </div>

        {/* 우측 네비게이션 */}
        <div className="flex items-center space-x-4">
          {/* 모바일 검색 아이콘 */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {session ? (
            <div className="flex items-center space-x-3">
              {/* 알림 */}
              <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center animate-bounce">3</span>
              </Button>

              {/* 위시리스트 */}
              <Button variant="ghost" size="sm" className="relative hover:bg-red-50 transition-colors">
                <Heart className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center">2</span>
              </Button>

              {/* 장바구니 */}
              <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 transition-colors">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </Button>

              {/* 사용자 메뉴 */}
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-3 group cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/api/auth/signin">
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  로그인
                </Button>
              </Link>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                회원가입
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}