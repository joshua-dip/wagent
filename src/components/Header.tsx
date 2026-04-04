"use client"

import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { User, LogOut, ShoppingCart, Download, CreditCard, PenTool, Star } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client"
import { useCart } from "@/contexts/CartContext"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "서술형 자료", icon: PenTool },
  { href: "/products/free", label: "무료 자료", icon: Star },
]

export default function Header() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const { cartCount } = useCart()
  const pathname = usePathname()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAdmin =
    currentUser?.email === "wnsrb2898@naver.com" ||
    simpleAuth.user?.role === "admin"

  const isAdminPage = pathname?.startsWith("/admin")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-3 px-3 sm:px-5 lg:px-8 max-w-[1600px] mx-auto border-b border-emerald-100/80">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md shadow-[#5eead4]/35 group-hover:shadow-[#5eead4]/50 transition-shadow bg-[linear-gradient(135deg,#6ee7b7_0%,#5eead4_45%,#2dd4bf_100%)]"
            aria-hidden
          >
            P
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
              PAYPERIC
            </span>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-none hidden sm:block">
              서술형은 페이퍼릭
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative hover:bg-emerald-50 text-slate-600 p-2 h-9 w-9 sm:h-10 sm:w-10"
                  aria-label="장바구니"
                >
                  <ShoppingCart className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-0.5 bg-emerald-500 rounded-full text-[10px] text-white flex items-center justify-center font-semibold">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              <div
                className="relative pl-2 sm:pl-3 border-l border-slate-200"
                ref={userMenuRef}
              >
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-50 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-sm shadow-emerald-200/50">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden lg:block text-left max-w-[140px]">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {currentUser?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                    </div>
                    <Link href="/my/purchases" onClick={() => setIsUserMenuOpen(false)}>
                      <div className="flex items-center px-4 py-2.5 hover:bg-emerald-50/90 transition-colors">
                        <Download className="h-4 w-4 text-slate-500 mr-3" />
                        <span className="text-sm text-slate-700">구매한 자료</span>
                      </div>
                    </Link>
                    <Link href="/user-dashboard" onClick={() => setIsUserMenuOpen(false)}>
                      <div className="flex items-center px-4 py-2.5 hover:bg-emerald-50/90 transition-colors">
                        <User className="h-4 w-4 text-slate-500 mr-3" />
                        <span className="text-sm text-slate-700">내 정보</span>
                      </div>
                    </Link>
                    <Link href="/my/orders" onClick={() => setIsUserMenuOpen(false)}>
                      <div className="flex items-center px-4 py-2.5 hover:bg-emerald-50/90 transition-colors">
                        <CreditCard className="h-4 w-4 text-slate-500 mr-3" />
                        <span className="text-sm text-slate-700">주문 내역</span>
                      </div>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/dashboard" onClick={() => setIsUserMenuOpen(false)}>
                        <div className="flex items-center px-4 py-2.5 hover:bg-amber-50 transition-colors border-t border-slate-100 mt-1 pt-2">
                          <span className="text-sm text-amber-800 font-medium">관리자</span>
                        </div>
                      </Link>
                    )}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsUserMenuOpen(false)
                          if (session) {
                            signOut()
                            return
                          }
                          if (isSupabaseConfigured()) {
                            try {
                              const sb = createClient()
                              await sb.auth.signOut()
                            } catch {
                              /* noop */
                            }
                          }
                          await fetch("/api/auth/check-session", {
                            method: "DELETE",
                            credentials: "include",
                          })
                          window.location.href = "/"
                        }}
                        className="w-full flex items-center px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 text-slate-500 mr-3" />
                        <span className="text-sm text-slate-700">로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/simple-signin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 h-9 text-sm"
                >
                  로그인
                </Button>
              </Link>
              <Link href="/auth/simple-signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/25 h-9 px-3 sm:px-4 text-sm font-semibold"
                >
                  카카오 가입
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sub navigation */}
      {!isAdminPage && (
        <nav className="border-b border-slate-100 bg-white/80">
          <div className="flex items-center gap-1 px-3 sm:px-5 lg:px-8 max-w-[1600px] mx-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                    isActive
                      ? "border-emerald-500 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
