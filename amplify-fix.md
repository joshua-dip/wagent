# AWS Amplify 500 Error 해결 가이드

## 환경 변수 재설정

### 1. NEXTAUTH_URL 업데이트
AWS Amplify > Environment Variables에서:
```
NEXTAUTH_URL = https://main.실제도메인.amplifyapp.com
```

### 2. 전체 환경 변수 재확인
```
MONGODB_URI = mongodb+srv://wnsrb2898:rlWafGmJZutiNxfl@cluster0.i5tkzcy.mongodb.net/wagent?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_SECRET = cay9LZQ6T//LkS0jWvFbdNsiXQrgOy2dO8RRp2bqtIU=
NEXTAUTH_URL = https://main.실제도메인.amplifyapp.com
NODE_ENV = production
```

## 빠른 수정사항

### 3. NextAuth.js 설정 업데이트 (필요시)
```javascript
// src/lib/auth.ts에 추가
trustHost: true,
useSecureCookies: process.env.NODE_ENV === "production",
```

### 4. 즉시 재배포
환경 변수 수정 후:
1. AWS Amplify > Deployments
2. "Redeploy this version" 클릭
3. 5분 대기

## 문제 진단 순서
1. 환경 변수 확인
2. 로그 확인  
3. MongoDB 연결 테스트
4. NextAuth 설정 확인