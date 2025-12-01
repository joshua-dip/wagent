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
  Download,
  ShoppingCart,
  User,
  LucideIcon
} from "lucide-react"

export type UserRole = 'user' | 'admin'

export interface MenuItem {
  title: string
  href: string
  icon: LucideIcon
  roles?: UserRole[] // 이 메뉴에 접근 가능한 역할 (없으면 모두 접근 가능)
  badge?: string | number // 선택적 배지
  isNew?: boolean // 새 메뉴 표시
}

export interface MenuSection {
  title: string
  roles?: UserRole[] // 이 섹션에 접근 가능한 역할 (없으면 모두 접근 가능)
  items: MenuItem[]
}

/**
 * 전체 메뉴 구성
 * - roles가 없으면 모든 사용자가 볼 수 있음
 * - roles가 있으면 해당 역할을 가진 사용자만 볼 수 있음
 */
export const menuConfig: MenuSection[] = [
  // ===================================
  // 메인 메뉴 (모든 사용자)
  // ===================================
  {
    title: "메인",
    items: [
      {
        title: "대시보드",
        href: "/",
        icon: LayoutDashboard,
        // 모든 사용자가 볼 수 있음
      },
      {
        title: "구매한 자료 다운로드",
        href: "/my/purchases",
        icon: Download,
        // 모든 사용자가 볼 수 있음
      },
      {
        title: "공유 자료",
        href: "/products/free",
        icon: Star,
        // 모든 사용자가 볼 수 있음
      },
    ]
  },

  // ===================================
  // 카테고리 (모든 사용자)
  // ===================================
  {
    title: "카테고리",
    items: [
      {
        title: "2025 영어모의고사",
        href: "/products/2025-english-mock",
        icon: FileText,
        // 모든 사용자가 볼 수 있음
      },
    ]
  },

  // ===================================
  // 관리자 전용 - 서술형 맞춤 제작
  // ===================================
  {
    title: "맞춤 제작",
    roles: ['admin'], // 관리자만 이 섹션을 볼 수 있음
    items: [
      {
        title: "서술형 자료 맞춤 제작",
        href: "/custom-order",
        icon: PenTool,
        roles: ['admin'],
      },
    ]
  },

  // ===================================
  // 관리자 전용 - 추가 카테고리
  // ===================================
  {
    title: "전체 카테고리",
    roles: ['admin'], // 관리자만 이 섹션을 볼 수 있음
    items: [
      {
        title: "2025 영어모의고사",
        href: "/products/2025-english-mock",
        icon: FileText,
        roles: ['admin'],
      },
      {
        title: "EBS수능특강영어",
        href: "/products/ebs-special-english",
        icon: BookOpen,
        roles: ['admin'],
      },
      {
        title: "EBS수능특강영어독해",
        href: "/products/ebs-english-reading",
        icon: BookOpen,
        roles: ['admin'],
      },
      {
        title: "부교재자료 (쏠북링크)",
        href: "/products/supplementary-materials",
        icon: Package,
        roles: ['admin'],
      },
    ]
  },

  // ===================================
  // 관리자 전용 - 관리 메뉴
  // ===================================
  {
    title: "관리자",
    roles: ['admin'], // 관리자만 이 섹션을 볼 수 있음
    items: [
      {
        title: "관리자 대시보드",
        href: "/admin/dashboard",
        icon: BarChart3,
        roles: ['admin'],
      },
      {
        title: "자료 업로드",
        href: "/admin/upload",
        icon: Upload,
        roles: ['admin'],
        isNew: true, // 새 기능 표시
      },
      {
        title: "상품 관리",
        href: "/admin/products",
        icon: Settings,
        roles: ['admin'],
      },
    ]
  },
]

/**
 * 사용자 역할에 따라 필터링된 메뉴를 반환
 */
export function getFilteredMenuByRole(userRole: UserRole): MenuSection[] {
  return menuConfig
    .filter(section => {
      // 섹션에 roles가 없으면 모든 사용자에게 표시
      if (!section.roles) return true
      // 섹션의 roles에 사용자 역할이 포함되어 있으면 표시
      return section.roles.includes(userRole)
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // 아이템에 roles가 없으면 모든 사용자에게 표시
        if (!item.roles) return true
        // 아이템의 roles에 사용자 역할이 포함되어 있으면 표시
        return item.roles.includes(userRole)
      })
    }))
    .filter(section => section.items.length > 0) // 아이템이 없는 섹션은 제거
}

/**
 * 사용자가 특정 경로에 접근 가능한지 확인
 */
export function canAccessPath(userRole: UserRole, path: string): boolean {
  for (const section of menuConfig) {
    for (const item of section.items) {
      if (item.href === path) {
        // 아이템에 roles가 없으면 모든 사용자 접근 가능
        if (!item.roles) return true
        // roles에 사용자 역할이 포함되어 있으면 접근 가능
        return item.roles.includes(userRole)
      }
    }
  }
  // 메뉴에 없는 경로는 기본적으로 접근 가능
  return true
}

