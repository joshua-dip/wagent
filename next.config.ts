import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // AWS Amplify 최적화
  trailingSlash: false,
  // 환경변수 명시적 전달
  env: {
    MONGODB_URI: process.env.MONGODB_URI || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
    // NODE_ENV는 Next.js 예약어라서 제외
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || '',
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || '',
    S3_REGION: process.env.S3_REGION || 'ap-northeast-2',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'payperic-products',
    STORAGE_TYPE: process.env.STORAGE_TYPE || 's3',
    // 기존 AWS_ 프리픽스도 지원
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || '',
    AWS_REGION: process.env.AWS_REGION || process.env.S3_REGION || 'ap-northeast-2',
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'payperic-products',
  },
};

// 빌드 시점 환경변수 확인
console.log('🔧 Next.js Config - 환경변수 상태:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT_SET');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

export default nextConfig;
