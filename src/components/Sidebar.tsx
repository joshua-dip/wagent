"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/SidebarContext"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { 
  LayoutDashboard, 
  Package, 
  BookOpen,
  FileText,
  Star,
  PenTool,
  Settings,
  Upload,
  BarChart3,
  Menu,
  ChevronLeft,
  ChevronRight
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
        title: "공유 자료",
        href: "/products/free",
        icon: Star,
      },
      {
        title: "주문 제작",
        href: "/custom-order",
        icon: PenTool,
      },



    ]
  },
  {
    title: "카테고리",
    items: [
      {
        title: "2025 영어모의고사",
        href: "/products/2025-english-mock",
        icon: FileText,
      },
      {
        title: "2024 영어모의고사",
        href: "/products/2024-english-mock",
        icon: FileText,
      },
      {
        title: "2023 영어모의고사",
        href: "/products/2023-english-mock",
        icon: FileText,
      },
      {
        title: "EBS수능특강영어",
        href: "/products/ebs-special-english",
        icon: BookOpen,
      },
      {
        title: "EBS수능특강영어독해",
        href: "/products/ebs-english-reading",
        icon: BookOpen,
      },
      {
        title: "부교재자료",
        href: "/products/supplementary-materials",
        icon: Package,
      },
    ]
  },


]

export default function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, isMobile } = useSidebar()
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  
  // 관리자인지 확인 (두 시스템 모두 체크)
  const isAdmin = currentUser?.email === "wnsrb2898@naver.com" || 
                  simpleAuth.user?.role === 'admin'

  // 관리자 메뉴 섹션 (조건부)
  const adminSection = isAdmin ? {
    title: "관리자",
    items: [
      {
        title: "관리자 대시보드",
        href: "/admin/dashboard",
        icon: BarChart3,
      },
      {
        title: "자료 업로드",
        href: "/admin/upload",
        icon: Upload,
      },
      {
        title: "상품 관리",
        href: "/admin/products",
        icon: Settings,
      },
    ]
  } : null

  // 전체 사이드바 섹션 (관리자 메뉴 조건부 추가)
  const allSections = [
    ...sidebarSections,
    ...(adminSection ? [adminSection] : [])
  ]

  return (
    <div className={cn(
      "border-r border-gray-200 transition-all duration-300 relative flex flex-col h-full",
      // 데스크톱에서는 기본 동작
      !isMobile && (isCollapsed ? "w-16 bg-gray-50/50" : "w-64 bg-gray-50/50"),
      // 모바일에서는 오버레이 모드 - 불투명한 배경
      isMobile && (isCollapsed ? "w-16 bg-gray-50/50" : "w-64 bg-white shadow-2xl z-40")
    )}>
      {/* 스크롤 가능한 메뉴 영역 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="space-y-6 pt-6 pb-6">
        {allSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={cn("px-3", sectionIndex === 0 && "pt-2")}>
            {!isCollapsed && (
              <h2 className="mb-3 px-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {section.title}
              </h2>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-white hover:shadow-sm group",
                    isCollapsed ? "justify-center" : "space-x-3",
                    pathname === item.href 
                      ? "bg-white shadow-sm text-blue-600 border-r-2 border-blue-600" 
                      : "text-gray-700 hover:text-gray-900"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    pathname === item.href ? "text-blue-600" : "text-gray-500"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span>{item.title}</span>
                      {/* 뱃지 (예시) */}
                      {item.href === "/cart" && (
                        <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">3</span>
                      )}
                      {item.href === "/wishlist" && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">2</span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* 하단 고정 접기/펼치기 버튼 */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full bg-white border border-gray-200 rounded-lg p-2.5 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center",
            isMobile && "bg-blue-50 border-blue-300", // 모바일에서 강조 표시
            isCollapsed && "p-2" // 접힌 상태에서는 패딩 줄이기
          )}
          title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {isCollapsed ? (
            <ChevronRight className={cn(
              "h-4 w-4 text-gray-600 hover:text-blue-600 transition-colors",
              isMobile && "text-blue-600" // 모바일에서 파란색
            )} />
          ) : (
            <ChevronLeft className={cn(
              "h-4 w-4 text-gray-600 hover:text-blue-600 transition-colors",
              isMobile && "text-blue-600" // 모바일에서 파란색
            )} />
          )}
        </button>
      </div>
    </div>
  )
}