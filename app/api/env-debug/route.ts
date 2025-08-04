import { NextResponse } from 'next/server';

export async function GET() {
  // 모든 환경변수 키 확인 (값은 숨김)
  const allEnvKeys = Object.keys(process.env).sort();
  
  // 우리가 설정한 환경변수들
  const ourEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NODE_ENV',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY',
    'S3_REGION',
    'S3_BUCKET_NAME',
    'STORAGE_TYPE',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME'
  ];
  
  const envStatus: Record<string, string> = {};
  
  ourEnvVars.forEach(key => {
    if (process.env[key]) {
      envStatus[key] = 'SET';
    } else {
      envStatus[key] = 'NOT_SET';
    }
  });
  
  return NextResponse.json({
    message: '환경변수 디버깅',
    timestamp: new Date().toISOString(),
    totalEnvVars: allEnvKeys.length,
    amplifyEnvVars: allEnvKeys.filter(k => k.startsWith('AMPLIFY_')).length,
    awsEnvVars: allEnvKeys.filter(k => k.startsWith('AWS_')).length,
    nextEnvVars: allEnvKeys.filter(k => k.startsWith('NEXT_')).length,
    ourEnvStatus: envStatus,
    // Amplify 특수 환경변수 확인
    amplifyAppId: process.env.AMPLIFY_APP_ID || 'NOT_SET',
    amplifyBranch: process.env.AMPLIFY_BRANCH || 'NOT_SET',
    // 실행 환경 확인
    isAmplify: !!process.env.AWS_EXECUTION_ENV,
    executionEnv: process.env.AWS_EXECUTION_ENV || 'NOT_SET'
  });
}