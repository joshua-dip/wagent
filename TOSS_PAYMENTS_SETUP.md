# Toss Payments API 키 설정 가이드

## 📋 API 키 정보

### 결제위젯 연동 키 (테스트)
Payment Widget으로 연동할 때 사용하는 키입니다.

```
클라이언트 키: test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
시크릿 키: test_gsk_Gv6LjeKD8ajQxlDJngQY3wYxAdXy
```

### API 개별 연동 키 (테스트)
SDK・API로 개별 연동할 때 사용하는 키입니다.

```
상점아이디(MID): payper8aqe
클라이언트 키: test_ck_Z61JOxRQVEnyanoxWn9QrW0X9bAq
시크릿 키: test_sk_QbgMGZzorzjPJx5M1PK2rl5E1em4
```

## ⚙️ 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# Toss Payments - 결제위젯 연동 키 (테스트)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_SECRET_KEY=test_gsk_Gv6LjeKD8ajQxlDJngQY3wYxAdXy

# Toss Payments - 상점 정보
TOSS_MID=payper8aqe

# API 버전
TOSS_API_VERSION=2022-11-16
```

## 🔑 키 사용 위치

### 1. **클라이언트 키** (`NEXT_PUBLIC_TOSS_CLIENT_KEY`)
브라우저에서 Payment Widget을 초기화할 때 사용합니다.

**사용 파일:**
- `app/cart/checkout/page.tsx` - 장바구니 결제 위젯
- `src/components/PaymentButton.tsx` - 단일 상품 결제 버튼

```typescript
const widgetClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
const paymentWidget = window.PaymentWidget(widgetClientKey, customerKey)
```

### 2. **시크릿 키** (`TOSS_SECRET_KEY`)
서버에서 결제 승인 API를 호출할 때 사용합니다. ⚠️ **절대 클라이언트에 노출되면 안 됩니다!**

**사용 파일:**
- `app/api/payments/confirm/route.ts` - 결제 승인 처리

```typescript
const tossSecretKey = process.env.TOSS_SECRET_KEY
const authHeader = `Basic ${Buffer.from(tossSecretKey + ':').toString('base64')}`
```

## 🧪 테스트 방법

### 테스트 카드 정보
```
카드번호: 1234-1234-1234-1234
유효기간: 미래 날짜 (예: 12/25)
CVC: 123
```

### 테스트 플로우
1. 로그인
2. 상품을 장바구니에 담기
3. 장바구니에서 "구매하기" 클릭
4. Payment Widget에서 결제 수단 선택
5. 테스트 카드 정보 입력
6. 결제 완료

## 🚀 프로덕션 전환

실제 서비스 오픈 시:

1. **Toss Payments 관리자 페이지**에서 실제 운영 키 발급
2. `.env.local` 대신 `.env.production` 파일 생성
3. 테스트 키를 운영 키로 교체:
   ```bash
   NEXT_PUBLIC_TOSS_CLIENT_KEY=live_gck_xxxxxxxxxxxxx
   TOSS_SECRET_KEY=live_gsk_xxxxxxxxxxxxx
   ```
4. AWS Amplify 환경 변수에도 동일하게 설정

## 📝 참고 사항

- **테스트 환경**: `test_` 접두사가 붙은 키 사용
- **운영 환경**: `live_` 접두사가 붙은 키 사용
- **시크릿 키 보안**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!
- **AWS Amplify**: 환경 변수는 Amplify 콘솔에서 별도 설정 필요

## 🔗 관련 문서

- [Toss Payments 개발자 문서](https://docs.tosspayments.com/)
- [결제위젯 연동 가이드](https://docs.tosspayments.com/guides/payment-widget)
- [테스트 카드 번호](https://docs.tosspayments.com/reference/test-card)

---

**작성일**: 2025년 11월 10일  
**API 버전**: 2022-11-16  
**상점아이디**: payper8aqe

