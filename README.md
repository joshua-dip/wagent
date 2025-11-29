# PAYPERIC

디지털 자료 마켓플레이스입니다. Next.js, MongoDB, NextAuth를 기반으로 구축되었습니다.

## 🚀 기능

- **디지털 자료 마켓**: 다양한 카테고리의 디지털 콘텐츠 판매
- **대시보드**: 판매 통계 및 인기 상품 현황 조회
- **사용자 인증**: NextAuth를 통한 로그인/로그아웃
- **검색 및 필터링**: 카테고리, 태그, 가격별 검색
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원

## 🛠 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + shadcn/ui
- **데이터베이스**: MongoDB
- **인증**: NextAuth.js
- **결제**: Toss Payments
- **폼 관리**: React Hook Form + Zod
- **아이콘**: Lucide React

## 📁 프로젝트 구조

```
payperic/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── auth/              # 인증 관련 페이지
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx          # 메인 페이지 (대시보드)
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── ui/           # shadcn/ui 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Layout.tsx
│   │   └── ProductCard.tsx
│   ├── lib/              # 유틸리티 및 설정
│   │   ├── auth.ts       # NextAuth 설정
│   │   ├── db.ts         # MongoDB 연결
│   │   └── utils.ts      # 공용 유틸리티
│   ├── models/           # MongoDB 스키마
│   ├── types/            # TypeScript 타입 정의
│   └── utils/            # 검증 스키마 등
└── public/               # 정적 파일
```

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd payperic
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-very-secure-secret-key-here

# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/wagent
# 또는 MongoDB Atlas 사용시:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wagent

# 토스페이먼츠 설정 (https://developers.tosspayments.com/)
# ⚠️ 상세 설정은 TOSS_PAYMENTS_SETUP.md 파일 참고

# 테스트 환경 (결제위젯 연동 키)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_SECRET_KEY=test_gsk_Gv6LjeKD8ajQxlDJngQY3wYxAdXy
TOSS_MID=payper8aqe

# 운영 환경 (실제 결제시)
# NEXT_PUBLIC_TOSS_CLIENT_KEY=live_gck_실제클라이언트키
# TOSS_CLIENT_KEY=live_gck_실제클라이언트키
# TOSS_SECRET_KEY=live_gsk_실제시크릿키

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AWS S3 (선택사항)
# S3_ACCESS_KEY_ID=your-access-key
# S3_SECRET_ACCESS_KEY=your-secret-key
# S3_REGION=ap-northeast-2
# S3_BUCKET_NAME=wagent-products
```

**토스페이먼츠 설정 가이드:**
- 📘 **상세 가이드**: [`TOSS_PAYMENTS_SETUP.md`](./TOSS_PAYMENTS_SETUP.md) 파일 참고
- 위 예시 키는 테스트용이며, 실제 운영 시 운영 키로 교체 필요
- Payment Widget 연동 방식 사용 (결제위젯 연동 키)

### 4. MongoDB 설정

#### 로컬 MongoDB 사용:
```bash
# MongoDB 설치 (macOS)
brew install mongodb-community

# MongoDB 시작
brew services start mongodb/brew/mongodb-community
```

#### MongoDB Atlas 사용:
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 계정 생성
2. 클러스터 생성
3. 연결 문자열을 `.env.local`의 `MONGODB_URI`에 추가

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📖 주요 페이지

### 🛍️ 쇼핑
- `/` - 메인 페이지 (홈)
- `/products` - 상품 목록
- `/products/[id]` - 상품 상세
- `/products/free` - 무료 자료
- `/cart` - 장바구니
- `/cart/checkout` - 결제하기 (Payment Widget)
- `/custom-order` - 맞춤 제작 서비스

### 🔐 인증
- `/auth/simple-signup` - 회원가입
- `/auth/simple-signin` - 로그인

### 💳 결제
- `/payment/success` - 결제 성공
- `/payment/fail` - 결제 실패

### 📄 정책
- `/terms` - 이용약관
- `/privacy` - 개인정보처리방침
- `/refund-policy` - 환불정책

## 🔑 인증

현재 관리자 계정:
- 이메일: `wnsrb2898@naver.com`
- 비밀번호: `jg117428281!`

실제 운영 시에는 `src/lib/auth.ts`에서 인증 로직을 수정하세요.

## 🎨 UI 컴포넌트

이 프로젝트는 [shadcn/ui](https://ui.shadcn.com/)를 사용합니다. 새로운 컴포넌트 추가:

```bash
npx shadcn-ui@latest add [component-name]
```

## 📱 반응형 디자인

- **모바일**: 320px 이상
- **태블릿**: 768px 이상  
- **데스크톱**: 1024px 이상

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.
## Environment Variables Update
Updated: Sun Nov 30 01:14:30 KST 2025
