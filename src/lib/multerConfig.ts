import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 업로드 디렉토리 확인 및 생성
const uploadDir = path.join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 안전한 파일명 생성: timestamp_원본파일명
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    const safeFileName = `${timestamp}_${nameWithoutExt.replace(/[^a-zA-Z0-9가-힣_-]/g, '_')}${extension}`;
    
    cb(null, safeFileName);
  }
});

// 파일 필터 (PDF만 허용)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('PDF 파일만 업로드 가능합니다.'));
  }
};

// multer 설정
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 제한
  }
});

// 파일 업로드 핸들러 생성
export const createUploadHandler = () => upload.single('pdfFile');