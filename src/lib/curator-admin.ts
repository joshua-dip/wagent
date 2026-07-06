import { ObjectId } from 'mongodb'

/** 관리자 모듈 입력 정규화 (생성/수정 공용). */
export function normalizeModuleInput(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (typeof body.code === 'string') out.code = body.code.trim()
  if (typeof body.category === 'string') out.category = body.category.trim()
  if (typeof body.title === 'string') out.title = body.title.trim()
  if (typeof body.description === 'string') out.description = body.description
  if (body.pages != null) out.pages = Math.max(0, Math.trunc(Number(body.pages) || 0))
  if (body.order != null) out.order = Math.trunc(Number(body.order) || 0)
  if (typeof body.isActive === 'boolean') out.isActive = body.isActive
  if ('diagnosticTags' in body) {
    const t = body.diagnosticTags
    const arr = Array.isArray(t) ? t : typeof t === 'string' ? t.split(',') : []
    out.diagnosticTags = arr.map((x) => String(x).trim()).filter(Boolean)
  }
  if ('pdfRef' in body) {
    const v = body.pdfRef
    out.pdfRef = typeof v === 'string' && ObjectId.isValid(v) ? new ObjectId(v) : null
  }
  return out
}

/** 관리자 진단문항 입력 정규화. */
export function normalizeQuestionInput(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (typeof body.prompt === 'string') out.prompt = body.prompt.trim()
  if (typeof body.setName === 'string') out.setName = body.setName.trim() || 'default'
  if (body.difficulty != null) out.difficulty = Math.min(5, Math.max(1, Math.trunc(Number(body.difficulty) || 1)))
  if (body.order != null) out.order = Math.trunc(Number(body.order) || 0)
  if (typeof body.isActive === 'boolean') out.isActive = body.isActive
  if ('tags' in body) {
    const t = body.tags
    const arr = Array.isArray(t) ? t : typeof t === 'string' ? t.split(',') : []
    out.tags = arr.map((x) => String(x).trim()).filter(Boolean)
  }
  if ('choices' in body && Array.isArray(body.choices)) {
    out.choices = (body.choices as Array<{ text?: unknown; isCorrect?: unknown }>)
      .map((c) => ({ text: String(c.text ?? '').trim(), isCorrect: c.isCorrect === true }))
      .filter((c) => c.text)
  }
  return out
}

export function validateQuestion(doc: Record<string, unknown>): string | null {
  if (!doc.prompt) return '문항(prompt)은 필수입니다.'
  const choices = doc.choices as Array<{ text: string; isCorrect: boolean }> | undefined
  if (!choices || choices.length < 2) return '선택지는 2개 이상이어야 합니다.'
  if (!choices.some((c) => c.isCorrect)) return '정답 선택지를 1개 이상 지정하세요.'
  return null
}
