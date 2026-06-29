import { NextRequest, NextResponse } from 'next/server'

/**
 * 외부 제작 도구(next-order 출제기)가 서버-서버로 상품을 적재할 때 쓰는
 * 공유 시크릿 인증. 관리자 세션(adminAuth) 과 별개 — 헤더 `x-ingest-secret` 를
 * `PAYPERIC_INGEST_SECRET` env 와 상수시간 비교한다.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

/** 인증 실패 시 NextResponse(에러), 통과 시 null. */
export function checkIngestSecret(request: NextRequest): NextResponse | null {
  const expected = process.env.PAYPERIC_INGEST_SECRET || ''
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'ingest 비활성화: 서버에 PAYPERIC_INGEST_SECRET 미설정' },
      { status: 503 },
    )
  }
  const got = request.headers.get('x-ingest-secret') || ''
  if (!got || !timingSafeEqual(got, expected)) {
    return NextResponse.json({ ok: false, error: '인증 실패' }, { status: 401 })
  }
  return null
}
