import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

// AWS S3 클라이언트 설정
export const s3Client = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || 'ap-northeast-2', // 서울 리전
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || 'wagent-products';

// Multer S3 설정
export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    key: function (req, file, cb) {
      const timestamp = Date.now();
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const extension = require('path').extname(originalName);
      const nameWithoutExt = require('path').basename(originalName, extension);
      const safeFileName = `products/${timestamp}_${nameWithoutExt.replace(/[^a-zA-Z0-9가-힣_-]/g, '_')}${extension}`;
      
      cb(null, safeFileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      // S3 메타데이터는 ASCII만 허용하므로 Base64 인코딩
      const originalNameEncoded = Buffer.from(file.originalname, 'utf8').toString('base64');
      cb(null, {
        'original-name': originalNameEncoded, // 하이픈으로 변경
        'uploaded-by': 'Payperic',
        'upload-date': new Date().toISOString()
      });
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('PDF 파일만 업로드 가능합니다.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 제한
  }
});

// 보안 다운로드 URL 생성 (임시 URL, 1시간 유효)
export async function generateSecureDownloadUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600 // 1시간
  });
  
  return signedUrl;
}

// 파일 삭제
export async function deleteFromS3(s3Key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  await s3Client.send(command);
}

// 파일 업로드 (멀터 없이 직접)
export async function uploadFileToS3(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const timestamp = Date.now();
  const safeFileName = `products/${timestamp}_${fileName.replace(/[^a-zA-Z0-9가-힣_.-]/g, '_')}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: safeFileName,
    Body: fileBuffer,
    ContentType: contentType,
    Metadata: {
      'original-name': Buffer.from(fileName, 'utf8').toString('base64'), // Base64 인코딩
      'uploaded-by': 'Payperic',
      'upload-date': new Date().toISOString()
    }
  });

  await s3Client.send(command);
  return safeFileName;
}