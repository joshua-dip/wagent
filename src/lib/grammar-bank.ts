/**
 * next-order 문법 문제은행 공개 API 프록시 (서버 전용, 키 숨김).
 *
 * env:
 *   GRAMMAR_BANK_API_URL  — 예: https://<next-order-host>/api/public/grammar-bank
 *   GRAMMAR_BANK_API_KEY  — /my/vip/qbank-api 에서 발급한 qbk_ 키
 */
const BASE = () => (process.env.GRAMMAR_BANK_API_URL || '').replace(/\/$/, '')
const KEY = () => process.env.GRAMMAR_BANK_API_KEY || ''

export function grammarBankConfigured(): boolean {
  return !!BASE() && !!KEY()
}

export interface GrammarTopic {
  topicKey: string; course: string; chapter: string; topic: string; unit: number | null; count: number
}
export interface GrammarItem {
  serial: string; topicKey: string; course: string; chapter: string; topic: string
  format: string; type: string; instruction: string; question: string
  options?: string[]; choices?: string[]; answer: string; explanation: string; source: string
}

async function callBank(params: Record<string, string | number | undefined>): Promise<Record<string, unknown>> {
  const base = BASE(); const key = KEY()
  if (!base || !key) throw new Error('문법 문제은행 API 미설정 (GRAMMAR_BANK_API_URL / GRAMMAR_BANK_API_KEY)')
  const url = new URL(base)
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${key}` }, cache: 'no-store', signal: ctrl.signal })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || (data as { ok?: boolean }).ok === false) {
      throw new Error((data as { error?: string }).error || `문제은행 응답 오류 (HTTP ${res.status})`)
    }
    return data as Record<string, unknown>
  } finally {
    clearTimeout(t)
  }
}

/** 진도(topic)별 문항 수 트리. */
export async function getGrammarTopics(): Promise<GrammarTopic[]> {
  const d = await callBank({ meta: 'topics' })
  return Array.isArray(d.topics) ? (d.topics as GrammarTopic[]) : []
}

/** 문항 조회 (mc 형식). */
export async function getGrammarQuestions(params: {
  topicKey?: string; course?: string; chapter?: string; topic?: string; source?: string
  sample?: number; limit?: number; offset?: number
}): Promise<{ items: GrammarItem[]; total: number }> {
  const d = await callBank({ ...params, format: 'mc' })
  return { items: Array.isArray(d.items) ? (d.items as GrammarItem[]) : [], total: Number(d.total) || 0 }
}
