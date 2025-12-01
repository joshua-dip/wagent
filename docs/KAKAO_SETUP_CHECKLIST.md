# 카카오 로그인 설정 체크리스트

## ✅ **완료해야 할 항목**

### 1️⃣ **카카오 개발자 등록** (5분)

```
□ Kakao Developers 접속 (https://developers.kakao.com/)
□ 카카오 계정으로 로그인
□ "내 애플리케이션" > "애플리케이션 추가하기"
□ 앱 이름: PAYPERIC
□ 사업자명: 입력
□ 카테고리: 교육
```

---

### 2️⃣ **앱 아이콘 업로드** (3분) ⭐ 필수

```
□ 앱 설정 > 요약 정보
□ 앱 아이콘 섹션에서 "등록" 클릭
□ 제공된 아이콘 변환:
  □ public/app-icon.svg 또는
  □ public/app-icon-book.svg 선택
  □ PNG 512x512로 변환
     → 가이드: docs/CONVERT_SVG_TO_PNG.md
□ PNG 파일 업로드 (최대 500KB)
□ 저장
```

**빠른 변환**: https://cloudconvert.com/svg-to-png

---

### 3️⃣ **플랫폼 설정** (2분)

```
□ 앱 설정 > 플랫폼
□ "Web 플랫폼 등록" 클릭
□ 사이트 도메인 입력:
  □ http://localhost:3000 (개발)
  □ https://www.payperic.com (운영)
□ 저장
```

---

### 4️⃣ **카카오 로그인 활성화** (3분)

```
□ 제품 설정 > 카카오 로그인
□ 활성화 설정 ON
□ Redirect URI 등록:
  □ http://localhost:3000/api/auth/kakao/callback
  □ https://www.payperic.com/api/auth/kakao/callback
□ 저장
```

---

### 5️⃣ **동의 항목 설정** (5분)

```
□ 제품 설정 > 카카오 로그인 > 동의항목
□ 닉네임 (profile_nickname):
  □ 동의 단계: 필수 동의
  □ 동의 목적: "회원 식별 및 서비스 이용"
  □ 저장
□ 프로필 사진 (profile_image):
  □ 동의 단계: 선택 동의 (또는 사용 안 함)
  □ 동의 목적: "프로필 표시"
□ 카카오계정(이메일) (account_email):
  ⚠️ "권한 없음" 표시되는 경우:
  □ 비즈 앱 전환 필요 (선택사항)
  □ 또는 임시 이메일로 테스트 진행
```

---

### 6️⃣ **API 키 확인** (1분)

```
□ 앱 설정 > 앱 키
□ REST API 키 복사
  → 이것이 NEXT_PUBLIC_KAKAO_CLIENT_ID
□ 제품 설정 > 카카오 로그인 > 보안
□ Client Secret 생성 (활성화 ON)
□ Client Secret 복사
  → 이것이 KAKAO_CLIENT_SECRET
```

---

### 7️⃣ **환경 변수 설정** (2분)

`.env.local` 파일에 추가:

```bash
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback
```

**체크리스트**:
```
□ .env.local 파일 생성/수정
□ NEXT_PUBLIC_KAKAO_CLIENT_ID 입력
□ KAKAO_CLIENT_SECRET 입력
□ NEXT_PUBLIC_KAKAO_REDIRECT_URI 확인
□ 파일 저장
```

---

### 8️⃣ **개발 서버 재시작** (1분)

```
□ 기존 서버 중지 (Ctrl + C)
□ npm run dev
□ http://localhost:3000 접속 확인
```

---

### 9️⃣ **테스트** (3분)

```
□ http://localhost:3000/auth/simple-signup 접속
□ "카카오로 가입하기" 버튼 확인
□ 버튼 클릭
□ 카카오 로그인 페이지로 리다이렉트 확인
□ 앱 아이콘 표시 확인
□ 동의 항목 표시 확인
□ 로그인 진행
□ 메인 페이지로 리다이렉트 확인
□ 사용자 이름 표시 확인
```

---

### 🔟 **배포 설정** (운영 시)

```
□ AWS Amplify Console 접속
□ Environment variables 메뉴
□ 다음 변수 추가:
  □ NEXT_PUBLIC_KAKAO_CLIENT_ID
  □ KAKAO_CLIENT_SECRET
  □ NEXT_PUBLIC_KAKAO_REDIRECT_URI
     = https://www.payperic.com/api/auth/kakao/callback
□ 재배포
□ 운영 환경에서 테스트
```

---

## 📊 **진행 상황 체크**

### 최소 요구사항 (개발/테스트용)
- ✅ 카카오 개발자 등록
- ✅ 앱 아이콘 업로드
- ✅ Web 플랫폼 등록
- ✅ 카카오 로그인 활성화
- ✅ Redirect URI 등록
- ✅ 닉네임 동의 항목 설정 (필수)
- ✅ REST API 키 발급
- ✅ 환경 변수 설정

### 운영 배포 전 추가 요구사항
- ⏳ 비즈 앱 전환 (이메일 권한)
- ⏳ Client Secret 활성화
- ⏳ 운영 도메인 등록
- ⏳ 개인정보처리방침 URL 등록

---

## ⏱️ **예상 소요 시간**

| 단계 | 소요 시간 |
|------|----------|
| 카카오 개발자 등록 | 5분 |
| 앱 아이콘 제작/업로드 | 3분 |
| 플랫폼 설정 | 2분 |
| 카카오 로그인 활성화 | 3분 |
| 동의 항목 설정 | 5분 |
| API 키 확인 | 1분 |
| 환경 변수 설정 | 2분 |
| 서버 재시작 & 테스트 | 4분 |
| **총합** | **약 25분** |

---

## 🆘 **문제 해결**

### 문제: "redirect_uri mismatch"
```
□ Redirect URI가 정확히 일치하는지 확인
□ http/https 프로토콜 확인
□ 포트 번호 확인 (:3000)
□ 카카오 콘솔에서 저장했는지 확인
```

### 문제: "invalid_client"
```
□ REST API 키를 사용하는지 확인 (JavaScript 키 아님)
□ NEXT_PUBLIC_KAKAO_CLIENT_ID 확인
□ 환경 변수 오타 확인
□ 서버 재시작
```

### 문제: 이메일 "권한 없음"
```
□ 닉네임만으로도 테스트 가능
□ 임시 이메일 자동 생성됨 (kakao_ID@kakao.user)
□ 운영 시에는 비즈 앱 전환 권장
```

### 문제: 앱 아이콘이 표시되지 않음
```
□ 512x512 크기 확인
□ 500KB 이하 확인
□ PNG/JPG 형식 확인
□ 카카오 콘솔에서 저장했는지 확인
□ 캐시 삭제 후 재시도
```

---

## 📚 **관련 문서**

- 📘 [카카오 로그인 설정 가이드](./KAKAO_LOGIN_SETUP.md)
- 🎨 [앱 아이콘 가이드](./KAKAO_APP_ICON_GUIDE.md)
- 🔄 [SVG → PNG 변환 방법](./CONVERT_SVG_TO_PNG.md)
- 💻 [카카오 로그인 구현 내용](./KAKAO_LOGIN_IMPLEMENTATION.md)

---

## ✅ **완료 확인**

모든 체크리스트를 완료했다면:

1. ✅ http://localhost:3000/auth/simple-signup 접속
2. ✅ "카카오로 가입하기" 버튼 클릭
3. ✅ 카카오 로그인 성공
4. ✅ 메인 페이지 리다이렉트
5. ✅ 사용자 이름 표시

**축하합니다! 🎉 카카오 로그인 설정이 완료되었습니다!**

---

지금 바로 시작하세요! ⚡

