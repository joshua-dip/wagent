# 🚨 결제 오류 해결 가이드

## 발생한 오류
```
❌ 결제 실패
결제 시스템 설정 오류입니다.
```

## 원인
`TOSS_SECRET_KEY` 환경 변수가 설정되지 않았거나, 서버가 환경 변수를 읽지 못하고 있습니다.

---

## ✅ 해결 방법

### 1️⃣ `.env.local` 파일 확인

프로젝트 루트 디렉토리에 `.env.local` 파일이 있는지 확인하세요.

```bash
# 터미널에서 확인
ls -la /Users/goshua/payperic/.env.local
```

### 2️⃣ 환경 변수 설정

`.env.local` 파일을 열고 다음 내용을 **추가 또는 수정**하세요:

```bash
# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-very-secure-secret-key-here-change-this

# MongoDB 설정 (기존 값 유지)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# ⭐ Toss Payments - 결제위젯 연동 키 (테스트) ⭐
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_SECRET_KEY=test_gsk_Gv6LjeKD8ajQxlDJngQY3wYxAdXy
TOSS_MID=payper8aqe

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AWS S3 (기존 값 유지)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET_NAME=your-bucket-name
STORAGE_TYPE=s3
```

### 3️⃣ 개발 서버 재시작 (중요! ⚠️)

환경 변수를 변경한 후 **반드시** 개발 서버를 재시작해야 합니다:

```bash
# 터미널에서 Ctrl + C로 현재 서버 중지
# 그 다음 서버 재시작
npm run dev
```

---

## 🔍 환경 변수 확인 방법

개발 서버를 재시작한 후, 브라우저에서 다음 URL로 접속하여 환경 변수가 제대로 설정되었는지 확인하세요:

```
http://localhost:3000/api/health
```

**정상 응답 예시:**
```json
{
  "status": "healthy",
  "environment": {
    "TOSS_CLIENT_KEY": true,
    "TOSS_SECRET_KEY": true,    // ✅ true여야 함!
    "MONGODB_URI": true,
    "NEXTAUTH_SECRET": true
  },
  "mongodb": {
    "status": "connected"
  }
}
```

---

## 📝 단계별 체크리스트

- [ ] 1. `.env.local` 파일 존재 확인
- [ ] 2. `TOSS_SECRET_KEY` 값 추가/확인
  ```
  TOSS_SECRET_KEY=test_gsk_Gv6LjeKD8ajQxlDJngQY3wYxAdXy
  ```
- [ ] 3. `NEXT_PUBLIC_TOSS_CLIENT_KEY` 값 추가/확인
  ```
  NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
  ```
- [ ] 4. 개발 서버 재시작 (Ctrl + C → npm run dev)
- [ ] 5. `/api/health` 엔드포인트로 환경 변수 확인
- [ ] 6. 장바구니 결제 재시도

---

## 🎯 빠른 복사 (전체)

아래 내용을 복사하여 `.env.local` 파일에 붙여넣으세요:

\`\`\`bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# Toss Payments (테스트)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_SECRET_KEY=test_gsk_Gv6LjeKD8ajQxlDJngQY3wYxAdXy
TOSS_MID=payper8aqe

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AWS (선택)
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=your-bucket
STORAGE_TYPE=s3
\`\`\`

---

## ⚠️ 주의사항

1. **환경 변수 파일 이름**: `.env.local` (점(.)으로 시작!)
2. **위치**: 프로젝트 루트 (`/Users/goshua/payperic/`)
3. **서버 재시작**: 환경 변수 변경 후 **반드시** 재시작
4. **Git 커밋 금지**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

---

## 🆘 여전히 오류가 발생하면?

1. **터미널 로그 확인**: 개발 서버 콘솔에서 오류 메시지 확인
2. **브라우저 콘솔 확인**: F12 → Console 탭에서 오류 확인
3. **Health Check**: `http://localhost:3000/api/health` 응답 확인
4. **환경 변수 출력**: 
   ```javascript
   // app/api/test-env/route.ts 임시 생성하여 확인
   console.log('TOSS_SECRET_KEY exists:', !!process.env.TOSS_SECRET_KEY)
   ```

---

**작성일**: 2025-11-10  
**문제**: 결제 시스템 설정 오류  
**해결**: 환경 변수 설정 및 서버 재시작

