import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authUser'
import { grammarBankConfigured, getGrammarTopics } from '@/lib/grammar-bank'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 문법 문제은행 진도 트리 (로그인 필요, 키는 서버에만). */
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!grammarBankConfigured()) return NextResponse.json({ configured: false, topics: [] })
  try {
    const topics = await getGrammarTopics()
    return NextResponse.json({ configured: true, topics })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || '문제은행 조회 실패' }, { status: 502 })
  }
}
