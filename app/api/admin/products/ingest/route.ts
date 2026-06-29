import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'
import { checkIngestSecret } from '@/lib/ingestAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Product 스키마의 category enum 과 동일하게 유지. */
const VALID_CATEGORIES = new Set([
  'shared-materials', 'original-translation', 'lecture-material', 'class-material', 'line-translation',
  'english-writing', 'translation-writing', 'workbook-blanks', 'workbook-word-order', 'workbook-grammar-choice', 'order-questions',
  'insertion-questions', 'ebs-lecture', 'ebs-workbook', 'ebs-test',
  'reading-comprehension', 'reading-strategy', 'reading-test',
  'grade1-material', 'grade2-material', 'grade3-material',
])

interface IngestBody {
  title?: string
  description?: string
  price?: number
  originalPrice?: number
  category?: string
  tags?: string[]
  isFree?: boolean
  batchKey?: string
  s3Key?: string
  originalFileName?: string
  fileSize?: number
  overwrite?: boolean
}

/**
 * presign 으로 S3 에 올린 파일을 상품으로 등록. (멱등 — title 중복은 skip)
 *
 * Body JSON: IngestBody
 * 응답: { ok, action: 'created'|'updated'|'skipped', productId, s3Key? }
 */
export async function POST(request: NextRequest) {
  const denied = checkIngestSecret(request)
  if (denied) return denied

  let body: IngestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON 본문 필요' }, { status: 400 })
  }

  const title = String(body.title ?? '').trim()
  const description = String(body.description ?? '').trim()
  const price = Number(body.price)
  const originalPrice =
    body.originalPrice != null && Number.isFinite(Number(body.originalPrice))
      ? Number(body.originalPrice)
      : undefined
  const category = String(body.category ?? '').trim()
  const isFree = body.isFree === true
  const overwrite = body.overwrite === true
  const batchKey = String(body.batchKey ?? '').trim()
  const s3Key = String(body.s3Key ?? '').trim()
  const originalFileName = String(body.originalFileName ?? '').trim()
  const fileSize = Number.isFinite(Number(body.fileSize)) ? Number(body.fileSize) : 0

  let tags = Array.isArray(body.tags)
    ? body.tags.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((s) => s.trim())
    : []
  if (batchKey) {
    const bt = `batch:${batchKey}`
    if (!tags.includes(bt)) tags.push(bt)
  }

  if (!title) return NextResponse.json({ ok: false, error: 'title 필요' }, { status: 400 })
  if (title.length > 200) return NextResponse.json({ ok: false, error: 'title 200자 초과' }, { status: 400 })
  if (!description) return NextResponse.json({ ok: false, error: 'description 필요' }, { status: 400 })
  if (!Number.isFinite(price) || price < 0) return NextResponse.json({ ok: false, error: 'price 형식 오류' }, { status: 400 })
  if (!category || !VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ ok: false, error: `category 오류: ${category || '(빈값)'}` }, { status: 400 })
  }
  if (!s3Key || !s3Key.startsWith('products/')) {
    return NextResponse.json({ ok: false, error: 's3Key 오류 (presign 응답값 사용)' }, { status: 400 })
  }

  const fileName = s3Key.split('/').pop() || s3Key
  const origName = originalFileName || fileName

  try {
    await connectDB()

    const existing = await Product.findOne({ title })
    if (existing && !overwrite) {
      return NextResponse.json({ ok: true, action: 'skipped', productId: String(existing._id) })
    }

    if (existing && overwrite) {
      existing.set({
        description,
        price,
        originalPrice,
        category,
        tags,
        isFree,
        fileName,
        originalFileName: origName,
        fileSize,
        filePath: s3Key,
        isActive: true,
      })
      await existing.save()
      return NextResponse.json({ ok: true, action: 'updated', productId: String(existing._id), s3Key })
    }

    const created = await Product.create({
      title,
      description,
      price,
      originalPrice,
      category,
      tags,
      author: 'PAYPERIC',
      authorId: 'admin',
      fileName,
      originalFileName: origName,
      fileSize,
      filePath: s3Key,
      isFree,
      isActive: true,
    })
    return NextResponse.json({ ok: true, action: 'created', productId: String(created._id), s3Key })
  } catch (err) {
    console.error('ingest 실패:', err)
    return NextResponse.json({ ok: false, error: (err as Error).message || '서버 오류' }, { status: 500 })
  }
}
