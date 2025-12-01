# 메뉴 및 권한 관리 가이드

## 📋 개요

이 프로젝트는 역할 기반 메뉴 시스템을 사용합니다. 사용자의 역할(일반 사용자 또는 관리자)에 따라 다른 메뉴가 표시됩니다.

## 🎯 주요 파일

### 1. 메뉴 설정 파일
**위치**: `src/config/menu-config.ts`

모든 메뉴 항목과 섹션을 정의하는 중앙 설정 파일입니다.

```typescript
export const menuConfig: MenuSection[] = [
  {
    title: "카테고리",
    items: [
      {
        title: "2025 영어모의고사",
        href: "/products/2025-english-mock",
        icon: FileText,
        // roles가 없으면 모든 사용자가 볼 수 있음
      },
    ]
  },
  {
    title: "관리자",
    roles: ['admin'], // 관리자만 이 섹션을 볼 수 있음
    items: [
      {
        title: "상품 관리",
        href: "/admin/products",
        icon: Settings,
        roles: ['admin'],
      },
    ]
  },
]
```

### 2. 권한 유틸리티 파일
**위치**: `src/utils/auth-utils.ts`

사용자 역할 및 권한 관련 유틸리티 함수를 제공합니다.

```typescript
// 관리자 이메일 목록
const ADMIN_EMAILS = [
  'wnsrb2898@naver.com',
  // 여기에 추가 관리자 이메일 추가
]

// 관리자 확인
isAdminUser(email, role) // true/false 반환

// 사용자 역할 가져오기
getUserRole(email, role) // 'admin' | 'user' 반환
```

## 🔧 사용법

### 새로운 메뉴 항목 추가

#### 1. 모든 사용자가 볼 수 있는 메뉴 추가

`src/config/menu-config.ts`를 열고:

```typescript
{
  title: "카테고리",
  items: [
    {
      title: "2025 영어모의고사",
      href: "/products/2025-english-mock",
      icon: FileText,
      // roles 속성 없음 = 모든 사용자 접근 가능
    },
    // ✅ 새 메뉴 추가
    {
      title: "새로운 카테고리",
      href: "/products/new-category",
      icon: BookOpen,
      isNew: true, // NEW 배지 표시
    },
  ]
},
```

#### 2. 관리자 전용 메뉴 추가

```typescript
{
  title: "관리자",
  roles: ['admin'], // 섹션 전체를 관리자만
  items: [
    {
      title: "상품 관리",
      href: "/admin/products",
      icon: Settings,
      roles: ['admin'],
    },
    // ✅ 새 관리자 메뉴 추가
    {
      title: "사용자 관리",
      href: "/admin/users",
      icon: Users,
      roles: ['admin'],
      badge: 5, // 배지에 숫자 표시
    },
  ]
},
```

### 새로운 관리자 추가

#### 방법 1: 코드에 직접 추가 (영구적)

`src/utils/auth-utils.ts`를 열고:

```typescript
const ADMIN_EMAILS = [
  'wnsrb2898@naver.com',
  'newadmin@example.com', // ✅ 새 관리자 이메일 추가
  'admin3@example.com',
]
```

#### 방법 2: 런타임에 추가 (임시적)

```typescript
import { addAdminEmail } from '@/utils/auth-utils'

// 새 관리자 추가
addAdminEmail('temporary-admin@example.com')

// 관리자 제거
removeAdminEmail('temporary-admin@example.com')
```

**주의**: 방법 2는 서버 재시작 시 초기화됩니다.

### 관리자 전용 경로 추가

`src/utils/auth-utils.ts`에서:

```typescript
const ADMIN_ONLY_PATHS = [
  '/admin',
  '/admin/dashboard',
  '/admin/upload',
  '/admin/products',
  '/admin/users', // ✅ 새 관리자 전용 경로 추가
]
```

## 📊 메뉴 구조

### 현재 구조

```
일반 사용자 (user)
└── 카테고리
    └── 2025 영어모의고사

관리자 (admin)
├── 메인
│   ├── 대시보드
│   ├── 구매한 자료 다운로드
│   ├── 공유 자료
│   └── 서술형 자료 맞춤 제작
├── 전체 카테고리
│   ├── 2025 영어모의고사
│   ├── EBS수능특강영어
│   ├── EBS수능특강영어독해
│   └── 부교재자료 (쏠북링크)
└── 관리자
    ├── 관리자 대시보드
    ├── 자료 업로드 (NEW)
    └── 상품 관리
```

## 🎨 메뉴 아이템 옵션

### MenuItem 인터페이스

```typescript
interface MenuItem {
  title: string           // 메뉴 제목
  href: string           // 링크 경로
  icon: LucideIcon       // 아이콘 컴포넌트
  roles?: UserRole[]     // 접근 가능한 역할 ['user', 'admin']
  badge?: string | number // 배지 텍스트/숫자
  isNew?: boolean        // NEW 배지 표시 여부
}
```

### 예시

```typescript
{
  title: "상품 관리",
  href: "/admin/products",
  icon: Settings,
  roles: ['admin'],
  badge: 12,        // 숫자 배지
  isNew: true,      // NEW 배지
}
```

## 🔒 권한 확인 함수

### 컴포넌트에서 사용

```typescript
import { getUserRole, isAdminUser } from '@/utils/auth-utils'

function MyComponent() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  
  const currentUser = simpleAuth.user || session?.user
  
  // 방법 1: 관리자 여부만 확인
  const isAdmin = isAdminUser(currentUser?.email, simpleAuth.user?.role)
  
  // 방법 2: 역할 가져오기
  const userRole = getUserRole(currentUser?.email, simpleAuth.user?.role)
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {userRole === 'user' && <UserPanel />}
    </div>
  )
}
```

### 경로 접근 확인

```typescript
import { canUserAccessPath, isAdminOnlyPath } from '@/utils/auth-utils'

// 특정 경로가 관리자 전용인지 확인
const isAdminPath = isAdminOnlyPath('/admin/products') // true

// 사용자가 경로에 접근 가능한지 확인
const canAccess = canUserAccessPath(
  '/admin/products',
  'user@example.com',
  'user'
) // false
```

## 🚀 확장 가이드

### 새로운 역할 추가 (예: 'teacher')

1. `src/config/menu-config.ts`에서 타입 수정:

```typescript
export type UserRole = 'user' | 'admin' | 'teacher'
```

2. `src/utils/auth-utils.ts`에서 타입 수정:

```typescript
export type UserRole = 'user' | 'admin' | 'teacher'
```

3. 역할 확인 로직 추가:

```typescript
const TEACHER_EMAILS = [
  'teacher1@example.com',
]

export function isTeacherUser(email?: string | null): boolean {
  if (!email) return false
  return TEACHER_EMAILS.includes(email)
}
```

4. 메뉴 설정에 teacher 역할 추가:

```typescript
{
  title: "교사 전용",
  roles: ['teacher', 'admin'],
  items: [
    {
      title: "수업 자료",
      href: "/teacher/materials",
      icon: BookOpen,
      roles: ['teacher', 'admin'],
    },
  ]
}
```

## 📝 베스트 프랙티스

1. **중앙화**: 모든 메뉴 설정을 `menu-config.ts`에 유지
2. **권한 분리**: 권한 로직은 `auth-utils.ts`에 유지
3. **일관성**: 같은 유틸리티 함수를 모든 컴포넌트에서 사용
4. **문서화**: 새 역할이나 메뉴 추가 시 이 문서 업데이트
5. **테스트**: 역할별로 로그인하여 메뉴가 올바르게 표시되는지 확인

## 🐛 문제 해결

### 메뉴가 표시되지 않음
- `getUserRole()`이 올바른 역할을 반환하는지 확인
- `menu-config.ts`에서 `roles` 속성이 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 사용자 정보 확인

### 관리자인데 관리자 메뉴가 안 보임
- 이메일이 `ADMIN_EMAILS` 배열에 있는지 확인
- 로그아웃 후 다시 로그인
- 세션 캐시 삭제

### 새로 추가한 메뉴가 안 보임
- 서버 재시작 (`npm run dev`)
- 브라우저 캐시 삭제 (Ctrl + Shift + R)
- 아이콘을 import 했는지 확인

## 📚 참고 자료

- [Lucide Icons](https://lucide.dev/) - 아이콘 라이브러리
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing) - 라우팅 문서

