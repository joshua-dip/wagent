# SVG를 PNG로 변환하는 방법

## 📁 제공된 아이콘 파일

프로젝트에 두 가지 아이콘을 만들어두었습니다:

1. **`public/app-icon.svg`** - 심플한 P 로고 (권장)
2. **`public/app-icon-book.svg`** - 책 모양 + P 로고

---

## 🔄 **온라인 변환 (가장 쉬움)**

### 방법 1: CloudConvert (무료, 회원가입 불필요)
1. https://cloudconvert.com/svg-to-png 접속
2. `app-icon.svg` 파일 업로드
3. 설정:
   - Width: **512**
   - Height: **512**
   - Quality: **Best**
4. "Convert" 클릭
5. 다운로드

### 방법 2: SVGtoPNG.com
1. https://svgtopng.com/ 접속
2. SVG 파일 업로드
3. 크기를 512x512로 설정
4. 다운로드

### 방법 3: Convertio
1. https://convertio.co/kr/svg-png/ 접속
2. SVG 파일 선택
3. 변환
4. 다운로드

---

## 🎨 **그래픽 도구 사용**

### Figma (무료, 추천)
1. [Figma](https://www.figma.com/) 접속
2. 새 파일 생성
3. SVG 파일을 캔버스에 드래그 앤 드롭
4. 아이콘 선택
5. **Export** → PNG
6. 설정:
   - **2x** 또는 직접 크기 입력 (512x512)
7. Export

### Canva (무료)
1. [Canva](https://www.canva.com/) 접속
2. "사용자 지정 크기" → 512 x 512 px
3. SVG 파일 업로드
4. 다운로드 → PNG

### Adobe Illustrator (유료)
1. SVG 파일 열기
2. **File > Export > Export As**
3. 형식: PNG
4. 크기: 512 x 512 px
5. Resolution: 72 PPI 이상
6. Export

---

## 💻 **macOS 사용자 (빠름)**

### Preview 앱 사용
1. SVG 파일을 Preview로 열기
2. **File > Export**
3. Format: PNG
4. Resolution: 512 x 512 (조정 필요 시)
5. Save

---

## 🌐 **브라우저에서 직접 변환**

### Chrome/Safari 사용
1. SVG 파일을 브라우저로 드래그
2. 브라우저 개발자 도구 열기 (F12)
3. Console에 다음 코드 붙여넣기:

```javascript
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = () => {
  ctx.drawImage(img, 0, 0, 512, 512);
  const link = document.createElement('a');
  link.download = 'app-icon.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};
img.src = URL.createObjectURL(new Blob([document.documentElement.outerHTML], {type: 'image/svg+xml'}));
```

---

## 🖼 **변환 후 확인사항**

변환된 PNG 파일 체크:
- ✅ 크기: 512 x 512 픽셀
- ✅ 형식: PNG
- ✅ 용량: 500KB 이하
- ✅ 선명도: 확대해도 깨지지 않음
- ✅ 배경: 투명 또는 단색

---

## 📤 **카카오에 업로드**

변환 완료 후:

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 선택
3. **앱 설정 > 요약 정보**
4. **앱 아이콘** 섹션에서 "등록" 클릭
5. 변환한 PNG 파일 업로드
6. 저장 ✅

---

## 🎯 **빠른 방법 요약**

가장 빠른 방법:
1. **CloudConvert** 사용 (회원가입 불필요)
2. `public/app-icon.svg` 업로드
3. 512x512 PNG로 변환
4. 다운로드
5. 카카오에 업로드

**소요 시간: 2분** ⚡

---

## 💡 **팁**

- 두 아이콘을 모두 PNG로 변환해보고 마음에 드는 것 선택
- 변환 시 투명 배경 유지되도록 설정
- 고해상도 옵션 선택 (300 DPI 이상 권장)

---

준비된 SVG 파일 위치:
- `/Users/goshua/payperic/public/app-icon.svg`
- `/Users/goshua/payperic/public/app-icon-book.svg`

이제 변환해서 카카오에 업로드하세요! 🚀

