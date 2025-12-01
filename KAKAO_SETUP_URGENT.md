# 🚨 긴급: 카카오 로그인 프로덕션 설정

## 문제
프로덕션에서 카카오 로그인 시 `localhost:3000`으로 리다이렉트됨

---

## 즉시 해야 할 일

### 1. 카카오 개발자 콘솔 접속
👉 https://developers.kakao.com/

### 2. 애플리케이션 선택
- 내 애플리케이션 목록에서 프로젝트 선택

### 3. Redirect URI 추가
**제품 설정 > 카카오 로그인 > Redirect URI**

#### ✅ 다음 URI들을 **모두** 추가:

```
http://localhost:3000/api/auth/kakao/callback
https://payperic.com/api/auth/kakao/callback
https://www.payperic.com/api/auth/kakao/callback
```

⚠️ **중요**: 
- `https://www.payperic.com` (www 포함)
- `https://payperic.com` (www 없음)
- **둘 다** 추가해야 합니다!

### 4. 저장 버튼 클릭

### 5. 상태 확인
- 카카오 로그인: **활성화** ✅
- Redirect URI: **3개 등록됨** ✅

---

## 📸 스크린샷 가이드

### Redirect URI 설정 화면
```
┌─────────────────────────────────────────────┐
│ Redirect URI                                │
│                                             │
│ ✓ http://localhost:3000/api/auth/kakao/... │
│ ✓ https://payperic.com/api/auth/kakao/...  │
│ ✓ https://www.payperic.com/api/auth/kakao/.│
│                                             │
│ [+] Redirect URI 추가                       │
└─────────────────────────────────────────────┘
```

---

## 테스트

설정 후 즉시 테스트:
1. https://www.payperic.com/auth/simple-signin 접속
2. "카카오로 계속하기" 클릭
3. 카카오 로그인
4. ✅ `https://www.payperic.com/` 으로 리다이렉트 확인

---

## ❓ 문제 해결

### Q: 여전히 localhost로 가는 경우
A: 
1. 브라우저 캐시 완전 삭제
2. 시크릿 모드에서 테스트
3. 카카오 개발자 콘솔에서 설정 다시 확인

### Q: "redirect_uri mismatch" 에러
A: 
- Redirect URI가 정확히 일치해야 함
- `https://`와 `http://` 구분
- `/api/auth/kakao/callback` 경로 확인

### Q: 설정 후에도 안 되는 경우
A:
- 5-10분 정도 기다린 후 재시도
- 카카오 서버에 설정 반영 시간 필요

---

## 🎯 체크리스트

- [ ] 카카오 개발자 콘솔 접속
- [ ] Redirect URI 3개 모두 추가
- [ ] 저장 버튼 클릭
- [ ] 브라우저 캐시 삭제
- [ ] 프로덕션에서 테스트
- [ ] ✅ 정상 작동 확인

---

이 작업은 **코드 수정이 아니라 카카오 콘솔 설정**입니다!

