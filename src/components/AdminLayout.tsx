"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Header from "./Header"
import { cn } from "@/lib/utils"
import { BarChart3, Upload, Package, Users, ArrowLeft } from "lucide-react"

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "대시보드", icon: BarChart3 },
  { href: "/admin/upload", label: "자료 업로드", icon: Upload },
  { href: "/admin/products", label: "상품 관리", icon: Package },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Header />

      {/* Admin nav bar */}
      <nav className="sticky top-14 sm:top-16 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-1 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
          <Link
            href="/"
            className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors px-2.5 py-3 mr-1 border-r border-slate-100 pr-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            사이트로
          </Link>
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
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

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
