"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession, signOut } from "next-auth/react"
import { ShoppingBag, Search, User, LogOut, ShoppingCart, Heart, Bell } from "lucide-react"
import Link from "next/link"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useRef, useEffect } from "react"

export default function Header() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // 두 인증 시스템 통합
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAdmin = currentUser?.email === "wnsrb2898@naver.com" || 
                  simpleAuth.user?.role === 'admin'

  // 키보드 입력 시 검색창 자동 포커스
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K 또는 일반 문자 입력 시 검색창 포커스
      if (event.metaKey && event.key === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
        return
      }
      
      // 특수키나 조합키가 아닌 일반 문자 입력 시
      if (
        !event.ctrlKey && 
        !event.metaKey && 
        !event.altKey && 
        event.key.length === 1 && 
        event.key.match(/[a-zA-Z0-9가-힣\s]/) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        searchInputRef.current?.focus()
        // 입력된 문자를 검색창에 추가
        if (searchInputRef.current) {
          searchInputRef.current.value = event.key
          // 커서를 끝으로 이동
          searchInputRef.current.setSelectionRange(1, 1)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-lg">
      <div className="flex h-20 items-center px-2 sm:px-4 gap-2 sm:gap-4">
        {/* 브랜드 로고 - 반응형 */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
          </div>
          <div className="hidden xs:block">
            <h1 className="font-bold text-lg sm:text-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              PAYPERIC
            </h1>
            <p className="text-xs text-gray-500 hidden xl:block font-medium">서술형은 페이퍼릭</p>
          </div>
        </Link>

        {/* 검색바 - 반응형 크기 조정 */}
        <div className="hidden sm:flex w-40 md:w-56 lg:w-64">
          <div className="relative w-full">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="검색..."
              className="pl-8 sm:pl-10 pr-8 sm:pr-12 h-8 sm:h-10 bg-gray-50 border-gray-200 rounded-lg sm:rounded-xl focus:bg-white focus:shadow-md focus:border-blue-300 transition-all duration-200 text-xs sm:text-sm"
            />
            <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1 sm:px-1.5 py-0.5 rounded text-xs hidden sm:block">
              ⌘K
            </div>
          </div>
        </div>

        {/* 우측 네비게이션 - 반응형 */}
        <div className="flex items-center space-x-1 sm:space-x-2 ml-auto">
          {/* 모바일 검색 아이콘 */}
          <Button variant="ghost" size="sm" className="sm:hidden p-1.5">
            <Search className="h-4 w-4" />
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* 알림 - 큰 화면에서만 표시 */}
              <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 transition-colors p-1.5 sm:p-2 hidden md:flex">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </Button>

              {/* 위시리스트 - 큰 화면에서만 표시 */}
              <Button variant="ghost" size="sm" className="relative hover:bg-red-50 transition-colors p-1.5 sm:p-2 hidden lg:flex">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">2</span>
              </Button>

              {/* 장바구니 - 항상 표시 */}
              <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 transition-colors p-1.5 sm:p-2">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </Button>



              {/* 사용자 메뉴 - 반응형 */}
              <div className="flex items-center space-x-1 sm:space-x-2 pl-2 sm:pl-3 border-l border-gray-200">
                <div className="flex items-center space-x-1 sm:space-x-2 group cursor-pointer">
                  <div className="relative">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full border border-white"></div>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-20">{currentUser?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (session) {
                      signOut()
                    } else {
                      // JWT 로그아웃
                      fetch('/api/auth/check-session', { method: 'DELETE' })
                        .then(() => window.location.href = '/')
                    }
                  }}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 p-1.5 sm:p-2"
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Link href="/auth/simple-signin">
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
                  로그인
                </Button>
              </Link>
              <Link href="/auth/simple-signup">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
                  가입
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}