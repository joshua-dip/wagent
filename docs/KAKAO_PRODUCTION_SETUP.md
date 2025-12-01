# 카카오 로그인 프로덕션 환경 설정

## 🚀 문제 해결: 배포 후 localhost로 리다이렉트되는 문제

프로덕션 환경에서 카카오 로그인 시 `localhost:3000`으로 리다이렉트되는 문제를 해결하는 방법입니다.

---

## 📋 해결 방법

### 1. 카카오 개발자 콘솔 설정

#### ✅ Redirect URI 추가

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 애플리케이션 선택
3. **제품 설정** > **카카오 로그인** 메뉴로 이동
4. **Redirect URI** 섹션에서 **[+] Redirect URI 추가** 클릭
5. 다음 URI들을 **모두 추가**:

```
# 로컬 개발 환경
http://localhost:3000/api/auth/kakao/callback

# 프로덕션 환경 (실제 도메인으로 변경)
https://your-production-domain.com/api/auth/kakao/callback

# 예시:
https://payperic.com/api/auth/kakao/callback
https://www.payperic.com/api/auth/kakao/callback
https://main.d1234567890.amplifyapp.com/api/auth/kakao/callback
```

**중요**: 
- `http://`와 `https://` 프로토콜을 구분합니다
- `www` 있는 버전과 없는 버전 모두 추가하세요
- AWS Amplify 도메인도 추가하세요

---

### 2. 코드 수정 완료 ✅

코드는 이미 수정되어 동적으로 Redirect URI를 생성합니다:

```typescript
// app/api/auth/kakao/callback/route.ts
const protocol = request.headers.get('x-forwarded-proto') || 'https'
const host = request.headers.get('host') || request.url
const KAKAO_REDIRECT_URI = `${protocol}://${host}/api/auth/kakao/callback`
```

이제 환경에 따라 자동으로:
- 로컬: `http://localhost:3000/api/auth/kakao/callback`
- 프로덕션: `https://your-domain.com/api/auth/kakao/callback`

---

### 3. 환경변수 설정 (선택사항)

`.env.local` 파일에서 `NEXT_PUBLIC_KAKAO_REDIRECT_URI`는 더 이상 사용되지 않습니다.

대신 필수 환경변수만 설정:

```bash
# .env.local
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

AWS Amplify 환경변수에도 동일하게 설정해야 합니다.

---

## 🧪 테스트 방법

### 로컬 환경 테스트
1. `npm run dev` 실행
2. 카카오 로그인 시도
3. 콘솔에서 확인:
   ```
   카카오 Redirect URI: http://localhost:3000/api/auth/kakao/callback
   ```

### 프로덕션 환경 테스트
1. 배포 완료 후 실제 도메인 접속
2. 카카오 로그인 시도
3. 서버 로그에서 확인:
   ```
   카카오 Redirect URI: https://your-domain.com/api/auth/kakao/callback
   ```

---

## ⚠️ 주의사항

### 카카오 개발자 콘솔에서 꼭 확인하세요:

1. **Redirect URI 등록 필수**
   - 카카오는 등록된 URI로만 리다이렉트를 허용합니다
   - 등록되지 않은 URI는 오류 발생

2. **동의 항목 설정**
   - 닉네임 (필수 동의)
   - 카카오계정(이메일) (선택 동의 또는 필수 동의)

3. **상태 확인**
   - 카카오 로그인: **활성화** 상태
   - 동의항목: **설정 완료** 상태

---

## 🔍 문제 해결

### 여전히 localhost로 리다이렉트되는 경우

1. **카카오 개발자 콘솔 확인**
   ```
   Redirect URI에 프로덕션 도메인이 등록되어 있는지 확인
   ```

2. **브라우저 캐시 삭제**
   ```
   카카오 로그인 페이지가 캐시될 수 있음
   ```

3. **서버 로그 확인**
   ```bash
   # 터미널에서 확인
   카카오 Redirect URI: ????
   ```

4. **환경변수 확인**
   ```bash
   # AWS Amplify 콘솔에서 확인
   NEXT_PUBLIC_KAKAO_CLIENT_ID
   KAKAO_CLIENT_SECRET
   ```

---

## 📱 AWS Amplify 도메인 확인 방법

1. AWS Amplify 콘솔 접속
2. 앱 선택
3. **도메인 관리** 섹션에서 도메인 확인

예시:
```
https://main.d1a2b3c4d5e6f7.amplifyapp.com
```

이 도메인을 카카오 개발자 콘솔에 등록하세요!

---

## ✅ 체크리스트

- [ ] 카카오 개발자 콘솔에 프로덕션 Redirect URI 추가
- [ ] AWS Amplify 도메인도 Redirect URI에 추가
- [ ] 코드 수정 완료 (동적 URI 생성)
- [ ] Git 커밋 & 푸시
- [ ] AWS Amplify 자동 배포 완료
- [ ] 프로덕션에서 카카오 로그인 테스트

---

## 🎯 최종 확인

프로덕션 환경에서:
1. 카카오 로그인 버튼 클릭
2. 카카오 로그인 페이지로 이동
3. 로그인 완료
4. **프로덕션 도메인의 메인 페이지로 리다이렉트** ✅

성공! 🎉

