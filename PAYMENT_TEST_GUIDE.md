# 🎉 결제 테스트 가이드

## ✅ 환경 변수 설정 완료!

Toss Payments 환경 변수가 `.env.local` 파일에 추가되었습니다:

```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_CLIENT_KEY=test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5
TOSS_SECRET_KEY=test_gsk_Gv6LjeKD8ajQxlDJngQY3wYxAdXy
TOSS_MID=payper8aqe
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

개발 서버가 재시작되었습니다! 🚀

---

## 🧪 테스트 단계

### 1️⃣ 환경 변수 확인
브라우저에서 접속:
```
http://localhost:3000/api/health
```

**확인 사항:**
```json
{
  "environment": {
    "TOSS_CLIENT_KEY": true,           // ✅
    "TOSS_SECRET_KEY": true,           // ✅ 중요!
    "NEXT_PUBLIC_TOSS_CLIENT_KEY": true, // ✅
    "TOSS_MID": "payper8aqe"           // ✅
  }
}
```

### 2️⃣ 결제 플로우 테스트

#### **Step 1: 로그인**
```
이메일: wnsrb2898@naver.com
비밀번호: jg117428281!
```

#### **Step 2: 장바구니에 상품 담기**
- 유료 상품 선택
- "장바구니 담기" 클릭

#### **Step 3: 결제 진행**
1. 장바구니 페이지로 이동
2. "구매하기" 버튼 클릭
3. Payment Widget 로드 확인 ✅
4. 결제 수단 선택 (카드)
5. **테스트 카드 정보 입력:**
   ```
   카드번호: 1234-1234-1234-1234
   유효기간: 12/25
   CVC: 123
   ```
6. 결제하기 클릭

#### **Step 4: 결제 성공 확인**
- ✅ 결제 성공 페이지로 리다이렉트
- ✅ 구매 내역 표시
- ✅ "자료 다운로드하기" 또는 "구매 내역 보기" 버튼 표시

---

## 📥 상품 다운로드

결제 성공 후 상품을 다운로드할 수 있는 방법:

### 방법 1: 결제 성공 페이지에서
```
결제 완료 → "자료 다운로드하기" 버튼 클릭
```

### 방법 2: 상품 상세 페이지에서
```
1. 구매한 상품 페이지로 이동
2. "다운로드" 버튼 표시됨 (구매 후)
3. 클릭하여 다운로드
```

### 방법 3: 마이페이지에서
```
1. 상단 메뉴에서 마이페이지 클릭
2. 구매 내역 확인
3. 각 상품별 다운로드 버튼 클릭
```

---

## 🔍 트러블슈팅

### 문제 1: 여전히 "결제 시스템 설정 오류"가 발생하는 경우

**원인:** 개발 서버가 새로운 환경 변수를 읽지 못함

**해결:**
```bash
# 터미널에서 서버 완전 중지
Ctrl + C

# 서버 재시작
npm run dev

# 또는 강제 종료 후 재시작
pkill -f "next dev"
npm run dev
```

### 문제 2: Payment Widget이 로드되지 않는 경우

**확인:**
1. 브라우저 콘솔(F12) 확인
2. `NEXT_PUBLIC_TOSS_CLIENT_KEY` 환경 변수 확인
3. 클라이언트 키가 `test_gck_`로 시작하는지 확인

### 문제 3: 결제는 성공했는데 confirm 실패

**원인:** `TOSS_SECRET_KEY`가 없거나 잘못됨

**확인:**
```bash
# 터미널에서 확인
grep TOSS_SECRET_KEY .env.local
```

**예상 출력:**
```
TOSS_SECRET_KEY=test_gsk_Gv6LjeKD8ajQxlDJngQY3wYxAdXy
```

---

## 🎯 예상되는 결제 플로우

```
장바구니 페이지
  ↓
[구매하기] 클릭
  ↓
결제 페이지 (Payment Widget 로드)
  ↓
결제 수단 선택 & 정보 입력
  ↓
[결제하기] 클릭
  ↓
Toss Payments 서버로 결제 요청
  ↓
결제 성공 → successUrl로 리다이렉트
  ↓
/payment/success?paymentKey=xxx&orderId=xxx&amount=xxx
  ↓
서버에서 결제 승인 API 호출 (/api/payments/confirm)
  ↓
Toss Payments 승인 API 호출 (TOSS_SECRET_KEY 사용)
  ↓
Purchase 레코드 DB에 저장
  ↓
결제 성공 페이지 표시 ✅
  ↓
[자료 다운로드하기] 버튼 클릭
  ↓
상품 다운로드 시작 📥
```

---

## 📊 결제 데이터 확인

### MongoDB에서 확인:
```javascript
// Purchase 컬렉션에서 최근 결제 확인
db.purchases.find().sort({ purchaseDate: -1 }).limit(5)
```

### API로 확인:
```bash
# 구매 내역 API 호출 (로그인 필요)
curl http://localhost:3000/api/purchases
```

---

## ✨ 다음 단계

결제가 성공하면:

1. ✅ **장바구니 자동 비움**
2. ✅ **구매 내역 DB 저장**
3. ✅ **결제 성공 페이지 표시**
4. ✅ **다운로드 버튼 활성화**
5. ✅ **마이페이지에서 구매 내역 확인 가능**

---

## 🚀 지금 바로 테스트하세요!

1. http://localhost:3000 접속
2. 로그인
3. 상품을 장바구니에 담기
4. 결제 진행
5. 성공! 🎉

**문제가 발생하면:**
- 브라우저 콘솔(F12) 확인
- http://localhost:3000/api/health 확인
- 개발 서버 로그 확인

---

**작성일**: 2025-11-10  
**상태**: ✅ 환경 변수 설정 완료, 서버 재시작 완료  
**다음**: 결제 테스트 진행

