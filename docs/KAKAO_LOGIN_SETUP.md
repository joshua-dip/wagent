# 카카오 로그인 설정 가이드

## 1. 카카오 개발자 계정 생성

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. "내 애플리케이션" 메뉴 선택
4. "애플리케이션 추가하기" 클릭

---

## 2. 애플리케이션 등록

### 기본 정보 입력
- **앱 이름**: PAYPERIC (또는 원하는 이름)
- **사업자명**: 사업자 정보 입력
- **카테고리**: 교육

### 앱 아이콘 등록 ⭐ 필수
1. 앱 설정 > 요약 정보
2. **앱 아이콘** 섹션에서 "등록" 클릭
3. 요구사항:
   - 크기: **512 x 512 픽셀**
   - 형식: PNG 또는 JPG
   - 용량: 최대 500KB
4. 제공된 아이콘 사용:
   - `public/app-icon.svg` → PNG로 변환
   - 상세 가이드: [`KAKAO_APP_ICON_GUIDE.md`](./KAKAO_APP_ICON_GUIDE.md)
   - 변환 방법: [`CONVERT_SVG_TO_PNG.md`](./CONVERT_SVG_TO_PNG.md)

### 플랫폼 설정
1. 앱 설정 > 플랫폼 선택
2. "Web 플랫폼 등록" 클릭
3. **사이트 도메인** 입력:
   - 개발: `http://localhost:3000`
   - 운영: `https://www.payperic.com`

---

## 3. 카카오 로그인 활성화

### 카카오 로그인 설정
1. 제품 설정 > 카카오 로그인 메뉴
2. "활성화 설정" ON
3. **Redirect URI** 등록:
   ```
   개발: http://localhost:3000/api/auth/kakao/callback
   운영: https://www.payperic.com/api/auth/kakao/callback
   ```

### 동의 항목 설정
1. 제품 설정 > 카카오 로그인 > 동의항목
2. 필수 동의 항목 설정:
   - ✅ **닉네임** (필수)
     - 동의 단계: 필수 동의
     - 동의 목적: "회원 식별 및 서비스 이용"
   - ✅ **프로필 사진** (선택)
     - 동의 단계: 선택 동의
     - 동의 목적: "프로필 표시"
   - ✅ **카카오계정(이메일)** (필수) ⚠️
     - **비즈 앱 전환 필요** (사업자등록증 제출)
     - 동의 단계: 필수 동의
     - 동의 목적: "회원 가입, 본인 확인, 구매 내역 관리, 영수증 발송"
     - 심사 기간: 1-3 영업일

**⚠️ 이메일 권한 없이도 테스트 가능**:
- 임시 이메일 자동 생성 (`kakao_ID@kakao.user`)
- 운영 전에는 반드시 비즈 앱 전환 필요

---

## 4. 환경 변수 설정

### .env.local 파일에 추가

```bash
# 카카오 로그인
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_rest_api_key_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback
```

### 키 찾는 방법
1. Kakao Developers > 내 애플리케이션 선택
2. 앱 설정 > 앱 키
3. **REST API 키** 복사 → `NEXT_PUBLIC_KAKAO_CLIENT_ID`
4. 제품 설정 > 카카오 로그인 > 보안
5. **Client Secret** 생성 및 복사 → `KAKAO_CLIENT_SECRET`

---

## 5. AWS Amplify 환경 변수 설정

### Amplify 콘솔에서 설정
1. AWS Amplify Console 접속
2. 앱 선택 > Environment variables
3. 다음 환경 변수 추가:

```
NEXT_PUBLIC_KAKAO_CLIENT_ID = your_live_kakao_rest_api_key
KAKAO_CLIENT_SECRET = your_live_kakao_client_secret
NEXT_PUBLIC_KAKAO_REDIRECT_URI = https://www.payperic.com/api/auth/kakao/callback
```

---

## 6. 테스트

### 로컬 테스트
1. 개발 서버 실행: `npm run dev`
2. `http://localhost:3000/auth/simple-signup` 접속
3. "카카오로 가입하기" 버튼 클릭
4. 카카오 로그인 진행
5. 자동으로 회원가입 및 로그인 완료

### 운영 환경 테스트
1. 배포 완료 후 `https://www.payperic.com/auth/simple-signup` 접속
2. 카카오 로그인 테스트

---

## 7. 인증 플로우

```
┌─────────────┐
│   사용자    │
└──────┬──────┘
       │ 1. "카카오로 가입하기" 클릭
       ▼
┌─────────────────────────────────────┐
│  https://kauth.kakao.com/oauth/     │
│  authorize?client_id=...            │
└──────┬──────────────────────────────┘
       │ 2. 카카오 로그인 & 동의
       ▼
┌─────────────────────────────────────┐
│  /api/auth/kakao/callback           │
│  ?code=AUTHORIZATION_CODE           │
└──────┬──────────────────────────────┘
       │ 3. Access Token 발급
       ▼
┌─────────────────────────────────────┐
│  https://kapi.kakao.com/v2/user/me  │
│  (사용자 정보 조회)                  │
└──────┬──────────────────────────────┘
       │ 4. DB에 사용자 저장/조회
       ▼
┌─────────────────────────────────────┐
│  JWT 토큰 생성 & 쿠키 설정          │
│  → 메인 페이지로 리다이렉트          │
└─────────────────────────────────────┘
```

---

## 8. 주요 파일

| 파일 | 설명 |
|------|------|
| `app/api/auth/kakao/callback/route.ts` | 카카오 OAuth 콜백 처리 |
| `app/auth/simple-signup/page.tsx` | 회원가입 페이지 (카카오 버튼) |
| `app/auth/simple-signin/page.tsx` | 로그인 페이지 (카카오 버튼) |
| `src/models/User.ts` | 사용자 모델 (kakaoId 필드) |

---

## 9. 문제 해결

### 오류: "redirect_uri mismatch"
- Kakao Developers에서 Redirect URI가 정확히 등록되었는지 확인
- 개발/운영 환경에 맞는 URI 사용

### 오류: "invalid_client"
- `KAKAO_CLIENT_ID`가 올바른지 확인
- REST API 키를 사용하는지 확인 (JavaScript 키 아님)

### 오류: "KOE320: 동의 항목 미설정"
- Kakao Developers > 동의항목에서 이메일, 닉네임 필수로 설정

---

## 10. 보안 권장사항

1. ✅ **Client Secret 사용**: 필수 (설정 활성화)
2. ✅ **HTTPS 사용**: 운영 환경에서는 반드시 HTTPS
3. ✅ **환경 변수 보안**: .env.local은 git에 커밋하지 않음
4. ✅ **토큰 만료 시간**: JWT 토큰 7일 설정
5. ✅ **HttpOnly 쿠키**: XSS 공격 방지

---

## 참고 자료

- [카카오 로그인 공식 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [REST API 참고](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)

