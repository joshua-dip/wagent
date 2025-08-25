import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // 기존 관리자 확인
    const existingAdmin = await Admin.findOne({ email: "wnsrb2898@naver.com" });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "관리자 계정이 이미 존재합니다.",
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
          createdAt: existingAdmin.createdAt
        }
      });
    }

    // 새 관리자 생성
    const admin = new Admin({
      email: "wnsrb2898@naver.com",
      password: "jg117428281!", // 모델에서 자동으로 해싱됨
      name: "관리자",
      role: "super_admin",
      isActive: true
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "관리자 계정이 성공적으로 생성되었습니다.",
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error("관리자 계정 생성 오류:", error);
    return NextResponse.json({ 
      error: "서버 오류가 발생했습니다.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// 관리자 계정 정보 조회 (개발용)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const admins = await Admin.find({}, { 
      password: 0 // 비밀번호는 제외하고 조회
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      totalAdmins: admins.length,
      admins: admins
    });

  } catch (error) {
    console.error("관리자 조회 오류:", error);
    return NextResponse.json({ 
      error: "서버 오류가 발생했습니다.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
