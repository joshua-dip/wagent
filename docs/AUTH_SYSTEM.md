# 인증 시스템 개선 가이드

## 📋 개요

[쏠북 사이트](https://solvook.com/member/signup)를 참고하여 카카오톡과 전화번호 인증 기반의 현대적인 로그인/회원가입 시스템을 구현했습니다.

## 🎯 주요 기능

### 1. 로그인 방식
- ✅ **카카오톡 로그인** - 3초만에 간편 로그인
- ✅ **전화번호 인증** - SMS 인증번호를 통한 로그인

### 2. 회원가입 방식
- ✅ **카카오톡 회원가입** - 원클릭 간편 가입
- ✅ **전화번호 인증** - SMS 인증을 통한 회원가입
- ✅ **약관 동의** - 이용약관 및 개인정보처리방침 동의

## 📁 파일 구조

```
app/auth/
├── signin/
│   └── page.tsx          # 새로운 로그인 페이지
├── signup/
│   └── page.tsx          # 새로운 회원가입 페이지
├── simple-signin/
│   └── page.tsx          # 기존 이메일 로그인 (레거시)
└── simple-signup/
    └── page.tsx          # 기존 이메일 회원가입 (레거시)

src/components/ui/
└── checkbox.tsx          # 약관 동의용 체크박스 컴포넌트
```

## 🚀 페이지 URL

- **새 로그인**: `/auth/signin`
- **새 회원가입**: `/auth/signup`
- **구 로그인**: `/auth/simple-signin` (레거시)
- **구 회원가입**: `/auth/simple-signup` (레거시)

## 🎨 UI/UX 특징

### 쏠북 스타일 디자인
- ✅ 큰 카카오톡 버튼 (노란색 배경)
- ✅ 전화번호 인증 버튼 (흰색 테두리)
- ✅ "지금 가입하면 아주 좋아요!" 카피
- ✅ "3초만에 가입 가능!" 강조
- ✅ 그라데이션 브랜드 로고

### 전화번호 인증 플로우
1. 전화번호 입력 (자동 하이픈 포맷팅: 010-0000-0000)
2. 인증번호 전송 버튼 클릭
3. SMS 인증번호 6자리 입력
4. 3분 카운트다운 타이머 표시
5. 인증번호 확인 → 로그인/가입 완료

## 🔧 구현 상태

### ✅ 완료된 기능
- [x] UI/UX 디자인 (쏠북 스타일)
- [x] 전화번호 포맷팅 (010-0000-0000)
- [x] 인증번호 입력 (6자리)
- [x] 카운트다운 타이머 (3분)
- [x] 약관 동의 체크박스
- [x] 반응형 디자인
- [x] 로딩 상태 표시

### ⏳ 구현 예정 (TODO)

#### 1. 전화번호 인증 API 연동
```typescript
// TODO: 인증번호 전송
POST /api/auth/phone/send-code
{
  "phoneNumber": "01012345678"
}

// TODO: 인증번호 확인
POST /api/auth/phone/verify-code
{
  "phoneNumber": "01012345678",
  "code": "123456"
}
```

#### 2. 카카오 OAuth 연동
```typescript
// TODO: 카카오 로그인
// Kakao Developers에서 앱 등록 필요
// REST API 키 발급
// 리다이렉트 URI 설정

// 참고: https://developers.kakao.com/
```

#### 3. SMS 서비스 연동
추천 SMS 서비스:
- **NHN Cloud SMS** (구 Toast SMS)
- **Coolsms** (가장 많이 사용)
- **Aligo**
- **Cafe24 SMS**

#### 4. 데이터베이스 스키마
```typescript
// User 모델에 추가 필요
interface User {
  phoneNumber?: string      // 전화번호
  phoneVerified: boolean    // 전화번호 인증 여부
  kakaoId?: string          // 카카오 ID
  signupMethod: 'email' | 'phone' | 'kakao'
}
```

## 📝 사용법

### 프론트엔드에서 사용

```typescript
// 로그인 페이지로 이동
router.push('/auth/signin')

// 회원가입 페이지로 이동
router.push('/auth/signup')
```

### 헤더/네비게이션 업데이트

```typescript
// src/components/Header.tsx
<Link href="/auth/signin">
  <Button>로그인</Button>
</Link>

<Link href="/auth/signup">
  <Button>회원가입</Button>
</Link>
```

## 🔌 API 연동 예시

### 전화번호 인증번호 전송

```typescript
const handleSendCode = async () => {
  const response = await fetch('/api/auth/phone/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: phoneNumber.replace(/[^0-9]/g, '')
    })
  })
  
  const data = await response.json()
  if (response.ok) {
    setCodeSent(true)
    startCountdown()
  }
}
```

### 인증번호 확인 및 로그인

```typescript
const handleVerifyCode = async () => {
  const response = await fetch('/api/auth/phone/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: phoneNumber.replace(/[^0-9]/g, ''),
      code: verificationCode
    })
  })
  
  const data = await response.json()
  if (response.ok) {
    // 로그인 성공
    router.push('/')
  }
}
```

### 카카오 로그인

```typescript
const handleKakaoLogin = () => {
  const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID
  const REDIRECT_URI = `${window.location.origin}/api/auth/kakao/callback`
  
  window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`
}
```

## 🎨 커스터마이징

### 브랜드 컬러 변경

```tsx
// 카카오 버튼 색상
className="bg-[#FEE500] hover:bg-[#FDD835]"

// 브랜드 그라데이션
className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600"
```

### 카운트다운 시간 변경

```typescript
setCountdown(180) // 3분 (초 단위)
setCountdown(300) // 5분
```

### 인증번호 자릿수 변경

```typescript
maxLength={6} // 6자리
maxLength={4} // 4자리
```

## 🔒 보안 고려사항

### 1. 인증번호 보안
- ✅ 인증번호는 6자리 랜덤 숫자
- ✅ 3분 후 자동 만료
- ✅ 5회 이상 실패 시 재전송 필요
- ✅ 같은 번호로 1분에 1회만 전송 가능

### 2. 전화번호 검증
- ✅ 한국 휴대폰 번호 형식만 허용 (010으로 시작)
- ✅ 11자리 숫자 확인
- ✅ 중복 가입 방지

### 3. 카카오 OAuth
- ✅ CSRF 토큰 사용
- ✅ State 파라미터 검증
- ✅ 리다이렉트 URI 화이트리스트

## 📊 비교: 기존 vs 새 시스템

| 기능 | 기존 (이메일) | 새 시스템 |
|------|--------------|-----------|
| 가입 시간 | ~1분 | **3초** |
| 필수 정보 | 이메일, 비밀번호, 이름 | 전화번호만 |
| 비밀번호 | 필요 | **불필요** |
| 본인 인증 | 없음 | **SMS 인증** |
| 소셜 로그인 | Google만 | **카카오톡** 추가 |
| UX | 전통적 | **현대적** |

## 🚦 마이그레이션 가이드

### 기존 사용자를 위한 호환성

```typescript
// 기존 이메일 로그인도 계속 지원
// /auth/simple-signin 유지

// 신규 사용자는 새 시스템 사용
// /auth/signin 추천
```

### 헤더 링크 업데이트

```typescript
// Before
<Link href="/auth/simple-signin">로그인</Link>

// After  
<Link href="/auth/signin">로그인</Link>
```

## 🧪 테스트 방법

### 로컬 테스트
1. `http://localhost:3000/auth/signin` 접속
2. "휴대폰 번호로 로그인하기" 클릭
3. 전화번호 입력: `010-1234-5678`
4. "인증번호" 버튼 클릭 (현재는 Mock)
5. 인증번호 입력: `123456`
6. "로그인하기" 클릭

### 카카오 로그인 테스트
1. Kakao Developers에서 앱 등록
2. REST API 키 발급
3. `.env.local`에 키 추가:
```env
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_app_key
KAKAO_CLIENT_SECRET=your_kakao_secret
```

## 📚 참고 자료

- [쏠북 회원가입](https://solvook.com/member/signup)
- [Kakao Developers](https://developers.kakao.com/)
- [Coolsms 문서](https://docs.coolsms.co.kr/)
- [Next-Auth.js](https://next-auth.js.org/)

## 🎯 다음 단계

1. ✅ SMS 서비스 선택 및 연동
2. ✅ 카카오 OAuth 앱 등록
3. ✅ API 엔드포인트 구현
4. ✅ 데이터베이스 스키마 업데이트
5. ✅ 헤더/네비게이션 링크 업데이트
6. ✅ 기존 사용자 마이그레이션 계획

