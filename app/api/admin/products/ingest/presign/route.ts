import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, BUCKET_NAME } from '@/lib/s3Config'
import { checkIngestSecret } from '@/lib/ingestAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 적재용 presigned PUT URL 발급.
 *
 * 외부 도구가 큰 파일(풀세트 ZIP 등)을 API Gateway(6MB) 한계 없이 S3 로 직접
 * 올릴 수 있게 한다. 흐름: presign → (외부에서 S3 로 PUT) → ingest 로 메타+s3Key 전송.
 *
 * Body JSON: { originalFileName: string, contentType?: string }
 * 응답: { ok, uploadUrl, s3Key, contentType }
 */
export async function POST(request: NextRequest) {
  const denied = checkIngestSecret(request)
  if (denied) return denied

  let body: { originalFileName?: string; contentType?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON 본문 필요' }, { status: 400 })
  }

  const originalFileName = String(body.originalFileName ?? '').trim()
  if (!originalFileName) {
    return NextResponse.json({ ok: false, error: 'originalFileName 필요' }, { status: 400 })
  }

  const contentType =
    body.contentType ||
    (originalFileName.toLowerCase().endsWith('.zip') ? 'application/zip' : 'application/pdf')

  // 업로드 스크립트와 동일한 키 규칙: products/<ts>_<safe-name>
  const ts = Date.now()
  const safe = originalFileName.replace(/[^a-zA-Z0-9가-힣_.-]/g, '_')
  const s3Key = `products/${ts}_${safe}`

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: contentType,
      Metadata: {
        'uploaded-by': 'PAYPERIC',
        'upload-date': new Date().toISOString(),
      },
    })
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 })
    return NextResponse.json({ ok: true, uploadUrl, s3Key, contentType })
  } catch (err) {
    console.error('presign 실패:', err)
    return NextResponse.json(
      { ok: false, error: (err as Error).message || 'presign 오류' },
      { status: 500 },
    )
  }
}
