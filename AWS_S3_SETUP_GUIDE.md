# 🚀 AWS S3 설정 완전 가이드

## 📋 Step 1: AWS 계정 준비
1. [AWS Console](https://aws.amazon.com/console/) 로그인
2. **서울 리전(ap-northeast-2)** 선택 확인

---

## 🪣 Step 2: S3 버킷 생성

### 2-1. S3 서비스 이동
- AWS Console에서 **"S3"** 검색 → 선택

### 2-2. 버킷 생성
```
버킷 이름: wagent-products (또는 원하는 고유한 이름)
리전: 아시아 태평양(서울) ap-northeast-2
```

### 2-3. 버킷 설정
- ✅ **모든 퍼블릭 액세스 차단** (보안을 위해)
- ✅ **버킷 버전 관리** 활성화 (선택사항)
- ✅ **기본 암호화** 활성화

---

## 👤 Step 3: IAM 사용자 생성

### 3-1. IAM 서비스 이동
- AWS Console에서 **"IAM"** 검색 → 선택

### 3-2. 사용자 생성
1. **사용자** → **사용자 생성** 클릭
2. 사용자 이름: `wagent-s3-user`
3. **액세스 키 - 프로그래밍 방식 액세스** 선택

### 3-3. 권한 정책 생성
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::wagent-products/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::wagent-products"
        }
    ]
}
```

### 3-4. 액세스 키 생성
- **액세스 키 ID**와 **비밀 액세스 키** 복사 (한 번만 보여짐!)

---

## ⚙️ Step 4: 환경변수 설정

### 4-1. .env.local 파일 수정
```bash
# 실제 AWS 정보로 교체
AWS_ACCESS_KEY_ID=AKIA...실제키...
AWS_SECRET_ACCESS_KEY=실제비밀키...
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET_NAME=wagent-products

# 저장소 타입을 S3로 변경
STORAGE_TYPE=s3
```

---

## 🧪 Step 5: 테스트

### 5-1. 서버 재시작
```bash
npm run dev
```

### 5-2. 업로드 테스트
1. `/admin/dashboard` 접속
2. "상품 업로드" → PDF 파일 업로드
3. 성공 메시지에 "(S3)" 표시 확인

### 5-3. S3 확인
- AWS S3 Console에서 `wagent-products` 버킷 확인
- `products/` 폴더에 파일 업로드 확인

---

## 🔄 Step 6: 마이그레이션 (선택사항)

### 기존 로컬 파일을 S3로 이동
```bash
# 마이그레이션 스크립트 실행
node scripts/migrate-to-s3.js
```

---

## 💰 Step 7: 비용 모니터링

### AWS 비용 계산기
- **저장비용**: $0.023/GB/월
- **요청비용**: PUT $0.005/1000건, GET $0.0004/1000건
- **전송비용**: 첫 1GB/월 무료

### 예상 비용 (월간)
```
- 파일 저장 (10GB): $0.23
- 업로드 (100회): $0.0005  
- 다운로드 (1000회): $0.0004
-----------------------
총합: 약 $0.23/월 (300원)
```

---

## 🎯 완료 체크리스트

- [ ] AWS 계정 생성 및 로그인
- [ ] S3 버킷 생성 (wagent-products)
- [ ] IAM 사용자 생성 및 권한 설정
- [ ] 액세스 키 생성 및 복사
- [ ] .env.local 환경변수 설정
- [ ] STORAGE_TYPE=s3 변경
- [ ] 서버 재시작
- [ ] 업로드 테스트
- [ ] S3 Console에서 파일 확인

---

## 🚨 보안 주의사항

1. **액세스 키 보안**
   - 절대 GitHub에 커밋하지 마세요
   - .env.local은 .gitignore에 포함됨

2. **최소 권한 원칙**
   - 필요한 권한만 부여
   - 정기적으로 액세스 키 교체

3. **버킷 보안**
   - 퍼블릭 액세스 차단 유지
   - 임시 URL(1시간)로 다운로드

---

## 🆘 문제해결

### 1. 업로드 실패
```bash
# 에러 확인
tail -f .next/app.log

# 권한 확인
aws s3 ls s3://wagent-products --profile default
```

### 2. 액세스 거부
- IAM 정책 다시 확인
- 버킷 이름 정확성 확인

### 3. 느린 업로드
- 리전 확인 (ap-northeast-2)
- 파일 크기 제한 확인 (50MB)

---

✅ **설정 완료 후 프로덕션 레벨의 안정적인 파일 저장소를 사용할 수 있습니다!**