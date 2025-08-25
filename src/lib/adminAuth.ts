import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";

// 관리자 권한 확인 함수
export async function checkAdminPermission(requiredRole: 'admin' | 'super_admin' = 'admin') {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { isAdmin: false, error: "인증이 필요합니다." };
    }

    await connectDB();

    // Admin 컬렉션에서 관리자 확인
    const admin = await Admin.findOne({ 
      email: session.user.email.toLowerCase(),
      isActive: true 
    });

    if (!admin) {
      return { isAdmin: false, error: "관리자 권한이 필요합니다." };
    }

    // 역할 권한 확인
    if (requiredRole === 'super_admin' && admin.role !== 'super_admin') {
      return { isAdmin: false, error: "슈퍼 관리자 권한이 필요합니다." };
    }

    return { 
      isAdmin: true, 
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    };

  } catch (error) {
    console.error('관리자 권한 확인 오류:', error);
    return { isAdmin: false, error: "권한 확인 중 오류가 발생했습니다." };
  }
}

// 클라이언트 사이드 관리자 확인 (이메일 기반)
export function isAdminUser(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  
  // 임시로 이메일 기반 확인 (추후 role 기반으로 변경 가능)
  return userEmail.toLowerCase() === "wnsrb2898@naver.com";
}
