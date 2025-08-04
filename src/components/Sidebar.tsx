"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart,
  Heart,
  CreditCard,
  User,
  BarChart3,
  Settings,
  BookOpen,
  Video,
  FileText,
  Image,
  Music,
  Code,
  Star,
  TrendingUp,
  Gift,
  Database
} from "lucide-react"

const sidebarSections = [
  {
    title: "메인",
    items: [
      {
        title: "대시보드",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "인기 상품",
        href: "/popular",
        icon: TrendingUp,
      },
      {
        title: "추천 상품",
        href: "/recommended",
        icon: Star,
      },
      {
        title: "무료 자료",
        href: "/products/free",
        icon: Gift,
      },
                {
            title: "관리자 메뉴",
            href: "/admin/dashboard",
            icon: Settings,
          },
          {
            title: "MongoDB 진단",
            href: "/debug/mongodb",
            icon: Database,
          },
    ]
  },
  {
    title: "카테고리",
    items: [
      {
        title: "모든 상품",
        href: "/products",
        icon: Package,
      },
      {
        title: "전자책",
        href: "/products/ebooks",
        icon: BookOpen,
      },
      {
        title: "동영상 강의",
        href: "/products/videos",
        icon: Video,
      },
      {
        title: "문서 자료",
        href: "/products/documents",
        icon: FileText,
      },
      {
        title: "이미지/디자인",
        href: "/products/images",
        icon: Image,
      },
      {
        title: "음원/사운드",
        href: "/products/audio",
        icon: Music,
      },
      {
        title: "소스코드",
        href: "/products/code",
        icon: Code,
      },
    ]
  },
  {
    title: "마이페이지",
    items: [
      {
        title: "장바구니",
        href: "/cart",
        icon: ShoppingCart,
      },
      {
        title: "위시리스트",
        href: "/wishlist",
        icon: Heart,
      },
      {
        title: "구매 내역",
        href: "/orders",
        icon: CreditCard,
      },
      {
        title: "내 정보",
        href: "/profile",
        icon: User,
      },
    ]
  },
  {
    title: "기타",
    items: [
      {
        title: "판매 통계",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        title: "설정",
        href: "/settings",
        icon: Settings,
      },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12 w-64 bg-gray-50/50 border-r border-gray-200">
      <div className="space-y-6 py-6">
        {sidebarSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="px-3">
            <h2 className="mb-3 px-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-white hover:shadow-sm",
                    pathname === item.href 
                      ? "bg-white shadow-sm text-blue-600 border-r-2 border-blue-600" 
                      : "text-gray-700 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4",
                    pathname === item.href ? "text-blue-600" : "text-gray-500"
                  )} />
                  <span>{item.title}</span>
                  {/* 뱃지 (예시) */}
                  {item.href === "/cart" && (
                    <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">3</span>
                  )}
                  {item.href === "/wishlist" && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">2</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* 프로모션 배너 */}
        <div className="mx-3 mt-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
            <h3 className="font-semibold text-sm mb-1">프리미엄 멤버십</h3>
            <p className="text-xs text-blue-100 mb-3">모든 자료를 무제한으로 이용하세요</p>
            <button className="w-full bg-white text-blue-600 text-xs font-medium py-2 rounded-md hover:bg-blue-50 transition-colors">
              업그레이드
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}