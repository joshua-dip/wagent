import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  console.log('🔍 User 모델 읽기 진단 API 시작');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    dbConnection: false,
    userModel: false,
    userCount: 0,
    sampleUsers: [] as any[],
    adminUser: false,
    error: null as any
  };

  try {
    // 1. MongoDB 연결
    console.log('MongoDB 연결 중...');
    await connectDB();
    diagnostics.dbConnection = true;
    console.log('MongoDB 연결 성공');

    // 2. User 모델 접근 테스트
    console.log('User 모델 접근 테스트...');
    const userCount = await User.countDocuments();
    diagnostics.userCount = userCount;
    diagnostics.userModel = true;
    console.log(`User 컬렉션에 ${userCount}개의 문서가 있습니다`);

    // 3. 관리자 사용자 확인
    const adminUser = await User.findOne({ email: 'wnsbr2898@naver.com' });
    if (adminUser) {
      diagnostics.adminUser = true;
      diagnostics.sampleUsers.push({
        type: 'admin',
        email: adminUser.email,
        name: adminUser.name,
        created: adminUser.createdAt
      });
    }

    // 4. 최근 사용자 몇 개 샘플 가져오기 (비밀번호 제외)
    const recentUsers = await User.find()
      .select('email name createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(3);

    diagnostics.sampleUsers.push(...recentUsers.map(user => ({
      type: 'user',
      email: user.email,
      name: user.name,
      created: user.createdAt,
      active: user.isActive
    })));

    console.log('User 모델 읽기 진단 완료');

    return NextResponse.json({
      success: true,
      message: `User 모델 읽기 성공 (총 ${userCount}명의 사용자)`,
      diagnostics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('User 모델 읽기 진단 오류:', error);
    
    diagnostics.error = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    };

    return NextResponse.json({
      success: false,
      message: `User 모델 읽기 실패: ${error.message}`,
      diagnostics,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}