/**
 * 사용자 역할 및 권한 관련 유틸리티 함수
 */

export type UserRole = 'user' | 'admin'

/**
 * 관리자 이메일 목록
 * 여기에 추가하면 해당 이메일을 가진 사용자는 자동으로 관리자 권한을 갖습니다.
 */
const ADMIN_EMAILS = [
  'wnsrb2898@naver.com',
  // 추가 관리자 이메일을 여기에 추가하세요
  // 'admin2@example.com',
  // 'admin3@example.com',
]

/**
 * 이메일 또는 역할로 관리자 여부 확인
 */
export function isAdminUser(email?: string | null, role?: string): boolean {
  if (!email && !role) return false
  
  // 역할이 'admin'이면 관리자
  if (role === 'admin') return true
  
  // 이메일이 관리자 목록에 있으면 관리자
  if (email && ADMIN_EMAILS.includes(email)) return true
  
  return false
}

/**
 * 사용자 역할 가져오기
 */
export function getUserRole(email?: string | null, role?: string): UserRole {
  return isAdminUser(email, role) ? 'admin' : 'user'
}

/**
 * 관리자 전용 경로 목록
 */
const ADMIN_ONLY_PATHS = [
  '/admin',
  '/admin/dashboard',
  '/admin/upload',
  '/admin/products',
  '/admin/storage-settings',
  // 추가 관리자 전용 경로를 여기에 추가하세요
]

/**
 * 특정 경로가 관리자 전용인지 확인
 */
export function isAdminOnlyPath(path: string): boolean {
  return ADMIN_ONLY_PATHS.some(adminPath => 
    path === adminPath || path.startsWith(`${adminPath}/`)
  )
}

/**
 * 사용자가 특정 경로에 접근 가능한지 확인
 */
export function canUserAccessPath(
  path: string, 
  email?: string | null, 
  role?: string
): boolean {
  // 관리자 전용 경로인 경우
  if (isAdminOnlyPath(path)) {
    return isAdminUser(email, role)
  }
  
  // 일반 경로는 모든 사용자 접근 가능
  return true
}

/**
 * 새 관리자 이메일 추가 (런타임)
 * 주의: 이 함수는 서버 재시작시 초기화됩니다.
 * 영구적으로 추가하려면 ADMIN_EMAILS 배열에 직접 추가하세요.
 */
export function addAdminEmail(email: string): void {
  if (!ADMIN_EMAILS.includes(email)) {
    ADMIN_EMAILS.push(email)
  }
}

/**
 * 관리자 이메일 제거 (런타임)
 */
export function removeAdminEmail(email: string): void {
  const index = ADMIN_EMAILS.indexOf(email)
  if (index > -1) {
    ADMIN_EMAILS.splice(index, 1)
  }
}

/**
 * 모든 관리자 이메일 목록 가져오기
 */
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS]
}

