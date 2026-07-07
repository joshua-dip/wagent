import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authUser'
import { grammarBankConfigured, getGrammarQuestions } from '@/lib/grammar-bank'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 문법 문제은행 문항 조회 (로그인 필요). ?topicKey= 또는 course/chapter/topic + sample/limit/offset */
export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!grammarBankConfigured()) return NextResponse.json({ configured: false, items: [], total: 0 })

  const sp = request.nextUrl.searchParams
  const num = (v: string | null) => (v != null && v !== '' ? Number(v) : undefined)
  try {
    const data = await getGrammarQuestions({
      topicKey: sp.get('topicKey') || undefined,
      course: sp.get('course') || undefined,
      chapter: sp.get('chapter') || undefined,
      topic: sp.get('topic') || undefined,
      source: sp.get('source') || undefined,
      sample: num(sp.get('sample')),
      limit: num(sp.get('limit')),
      offset: num(sp.get('offset')),
    })
    return NextResponse.json({ configured: true, ...data })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || '문제은행 조회 실패' }, { status: 502 })
  }
}
