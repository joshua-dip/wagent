import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Purchase from "@/models/Purchase";
import { ObjectId } from 'mongodb';
import { generateSecureDownloadUrl } from "@/lib/s3Config";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import fs from 'fs';
import path from 'path';

function normalizeS3Key(filePath: string): string {
  return filePath.replace("s3://", "").replace(/^\//, "");
}

function isS3Path(filePath: string): boolean {
  return (
    filePath.startsWith("s3://") ||
    filePath.startsWith("products/") ||
    !filePath.includes("/public/")
  );
}

function mimeForFilename(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".hwp")) return "application/x-hwp";
  return "application/pdf";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 통합 인증 확인 (NextAuth + JWT)
    const session = await getServerSession(authOptions);
    let currentUser = null;
    
    if (session?.user?.email) {
      // NextAuth 로그인
      currentUser = session.user;
    } else {
      // JWT 토큰 확인
      const cookieStore = await cookies();
      const token = cookieStore.get("wagent-auth")?.value;
      
      if (token) {
        try {
          const decoded = verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any;
          currentUser = decoded;
        } catch (error) {
          console.error("JWT 토큰 검증 실패:", error);
        }
      }
    }

    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    await connectDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // ObjectId 유효성 검사
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    }

    // 상품 조회
    const product = await Product.findOne({ 
      _id: id, 
      isActive: true 
    });

    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    const isAdmin = currentUser.email === "wnsrb2898@naver.com" ||
                    currentUser.role === "admin"

    // 무료 상품이 아닌 경우 구매 확인 (관리자는 건너뜀)
    if (product.price > 0 && !isAdmin) {
      // Purchase 테이블에서 구매 내역 확인
      const purchase = await Purchase.findOne({
        productId: id,
        userEmail: currentUser.email,
        paymentStatus: 'COMPLETED'
      });

      if (!purchase) {
        return NextResponse.json({ 
          error: "구매하지 않은 상품입니다. 먼저 구매해주세요." 
        }, { status: 403 });
      }

      // 다운로드 횟수 체크
      if (purchase.downloadCount >= purchase.maxDownloads) {
        return NextResponse.json({ 
          error: `다운로드 제한 횟수(${purchase.maxDownloads}회)를 초과했습니다.` 
        }, { status: 403 });
      }

      // Purchase의 다운로드 카운트 증가
      await Purchase.findByIdAndUpdate(purchase._id, { 
        $inc: { downloadCount: 1 },
        lastDownloadDate: new Date()
      });
    }

    // 다운로드 카운트 증가 (PDF+HWP 한 번에 받아도 1회)
    await Product.findByIdAndUpdate(id, {
      $inc: { downloadCount: 1 },
    });

    const orig = (product.originalFileName || "").toLowerCase();
    const hasPdfPrimary = orig.endsWith(".pdf");
    const hasHwpField = !!(product as { hwpFilePath?: string }).hwpFilePath;
    const hasHwpOnly = orig.endsWith(".hwp") && !hasHwpField;

    let pdfKey: string | null = null;
    let pdfName: string | null = null;
    let pdfSize: number | null = null;
    let hwpKey: string | null = null;
    let hwpName: string | null = null;
    let hwpSize: number | null = null;

    if (hasPdfPrimary) {
      pdfKey = product.filePath;
      pdfName = product.originalFileName;
      pdfSize = product.fileSize;
    }
    if (hasHwpField) {
      const p = product as {
        hwpFilePath: string;
        hwpOriginalFileName?: string;
        hwpFileSize?: number;
      };
      hwpKey = p.hwpFilePath;
      hwpName = p.hwpOriginalFileName || "file.hwp";
      hwpSize = p.hwpFileSize ?? null;
    }
    if (hasHwpOnly) {
      hwpKey = product.filePath;
      hwpName = product.originalFileName;
      hwpSize = product.fileSize;
    }

    try {
      const pdfOnS3 = pdfKey && isS3Path(pdfKey);
      const hwpOnS3 = hwpKey && isS3Path(hwpKey);
      if (pdfOnS3 || hwpOnS3) {
        const pdfDownloadUrl = pdfOnS3
          ? await generateSecureDownloadUrl(normalizeS3Key(pdfKey!))
          : null;
        const hwpDownloadUrl = hwpOnS3
          ? await generateSecureDownloadUrl(normalizeS3Key(hwpKey!))
          : null;

        const primaryUrl = pdfDownloadUrl || hwpDownloadUrl;
        const primaryName = pdfName || hwpName;
        const primarySize = pdfSize ?? hwpSize;

        return NextResponse.json({
          downloadUrl: primaryUrl,
          fileName: primaryName,
          fileSize: primarySize,
          pdfDownloadUrl,
          hwpDownloadUrl,
          pdfFileName: pdfName,
          hwpFileName: hwpName,
          pdfFileSize: pdfSize,
          hwpFileSize: hwpSize,
          storageType: "s3",
          message: "다운로드 링크가 생성되었습니다. (1시간 유효)",
        });
      }

      // 로컬 파일 (단일)
      const filePath = path.join(
        process.cwd(),
        "public",
        product.filePath.replace("/uploads/", "uploads/")
      );

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);
      const headers = new Headers();
      headers.set("Content-Type", mimeForFilename(product.originalFileName));
      headers.set(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(product.originalFileName)}"`
      );
      headers.set("Content-Length", fileBuffer.length.toString());

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (fileError) {
      console.error("파일 다운로드 오류:", fileError);
      return NextResponse.json({ 
        error: "파일 다운로드 중 오류가 발생했습니다." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("다운로드 API 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "다운로드 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}

// POST 메서드도 동일하게 처리 (구매 페이지에서 사용)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return GET(request, { params });
}