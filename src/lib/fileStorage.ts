// 파일 저장소 통합 관리 (로컬 ↔ S3 전환 가능)
import fs from 'fs';
import path from 'path';
import { uploadFileToS3, generateSecureDownloadUrl, deleteFromS3 } from './s3Config';

export type StorageType = 'local' | 's3';

// 환경에 따른 저장소 타입 결정
export const STORAGE_TYPE: StorageType = process.env.STORAGE_TYPE as StorageType || 'local';

export interface FileUploadResult {
  filePath: string;
  fileName: string;
  fileSize: number;
  storageType: StorageType;
}

export interface FileDownloadResult {
  downloadUrl?: string;
  fileBuffer?: Buffer;
  storageType: StorageType;
}

// 통합 파일 업로드
export async function uploadFile(
  file: File | Buffer, 
  originalFileName: string, 
  contentType: string = 'application/pdf'
): Promise<FileUploadResult> {
  const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
  const fileSize = buffer.length;

  if (STORAGE_TYPE === 's3') {
    // S3 업로드
    const s3Key = await uploadFileToS3(buffer, originalFileName, contentType);
    return {
      filePath: s3Key,
      fileName: s3Key.split('/').pop() || originalFileName,
      fileSize,
      storageType: 's3'
    };
  } else {
    // 로컬 업로드
    const timestamp = Date.now();
    const extension = path.extname(originalFileName);
    const nameWithoutExt = path.basename(originalFileName, extension);
    const safeFileName = `${timestamp}_${nameWithoutExt.replace(/[^a-zA-Z0-9가-힣_-]/g, '_')}${extension}`;
    
    const uploadDir = path.join(process.cwd(), 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, safeFileName);
    fs.writeFileSync(filePath, buffer);

    return {
      filePath: `uploads/products/${safeFileName}`,
      fileName: safeFileName,
      fileSize,
      storageType: 'local'
    };
  }
}

// 통합 파일 다운로드 URL 생성
export async function getDownloadUrl(filePath: string): Promise<FileDownloadResult> {
  if (STORAGE_TYPE === 's3') {
    // S3 보안 URL 생성
    const downloadUrl = await generateSecureDownloadUrl(filePath);
    return {
      downloadUrl,
      storageType: 's3'
    };
  } else {
    // 로컬 파일 읽기
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error('파일을 찾을 수 없습니다.');
    }
    
    const fileBuffer = fs.readFileSync(fullPath);
    return {
      fileBuffer,
      storageType: 'local'
    };
  }
}

// 통합 파일 삭제
export async function deleteFile(filePath: string): Promise<void> {
  if (STORAGE_TYPE === 's3') {
    // S3에서 삭제
    await deleteFromS3(filePath);
  } else {
    // 로컬에서 삭제
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}

// 저장소 정보 반환
export function getStorageInfo() {
  return {
    type: STORAGE_TYPE,
    isS3: STORAGE_TYPE === 's3',
    isLocal: STORAGE_TYPE === 'local'
  };
}