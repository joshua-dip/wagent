import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'
import { checkIngestSecret } from '@/lib/ingestAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 적재 상태 조회. 외부 도구가 "이 제목들 중 어떤 게 이미 올라가 있나" 확인.
 *
 * Body JSON: { titles: string[] }            — 정확 제목 매칭(레거시 업로드도 포함)
 * 또는 GET ?batchKey=...                      — batch:<key> 태그로 조회
 * 응답: { ok, existing: [{ title, price, isActive, isFree }] }
 */
export async function POST(request: NextRequest) {
  const denied = checkIngestSecret(request)
  if (denied) return denied

  let body: { titles?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON 본문 필요' }, { status: 400 })
  }

  const titles = Array.isArray(body.titles)
    ? body.titles.filter((t): t is string => typeof t === 'string' && t.trim() !== '').map((t) => t.trim())
    : []
  if (titles.length === 0) {
    return NextResponse.json({ ok: true, existing: [] })
  }

  try {
    await connectDB()
    const docs = await Product.find({ title: { $in: titles } })
      .select('title price isActive isFree')
      .lean()
    const existing = (docs as unknown as Array<{ title: string; price: number; isActive: boolean; isFree: boolean }>).map((d) => ({
      title: d.title,
      price: d.price,
      isActive: d.isActive,
      isFree: d.isFree,
    }))
    return NextResponse.json({ ok: true, existing })
  } catch (err) {
    console.error('ingest status 실패:', err)
    return NextResponse.json({ ok: false, error: (err as Error).message || '서버 오류' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const denied = checkIngestSecret(request)
  if (denied) return denied

  const batchKey = request.nextUrl.searchParams.get('batchKey')?.trim()
  if (!batchKey) {
    return NextResponse.json({ ok: false, error: 'batchKey 필요' }, { status: 400 })
  }

  try {
    await connectDB()
    const docs = await Product.find({ tags: `batch:${batchKey}` })
      .select('title price isActive isFree')
      .lean()
    const existing = (docs as unknown as Array<{ title: string; price: number; isActive: boolean; isFree: boolean }>).map((d) => ({
      title: d.title,
      price: d.price,
      isActive: d.isActive,
      isFree: d.isFree,
    }))
    return NextResponse.json({ ok: true, existing, count: existing.length })
  } catch (err) {
    console.error('ingest status(GET) 실패:', err)
    return NextResponse.json({ ok: false, error: (err as Error).message || '서버 오류' }, { status: 500 })
  }
}
