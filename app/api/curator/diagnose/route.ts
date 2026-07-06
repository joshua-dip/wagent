import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import DiagnosticQuestion from '@/models/DiagnosticQuestion'
import DiagnosticResult from '@/models/DiagnosticResult'
import CuratorModule from '@/models/CuratorModule'
import { getAuthUser } from '@/lib/authUser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface AnswerIn { questionId: string; selected: number }

/**
 * 진단 제출 → 채점 → 약점 태그 집계 → 모듈 추천 → 결과 저장.
 * Body: { sessionId, setName?, answers: [{questionId, selected}] }
 * 로그인 없이도 가능(sessionId 기반). 로그인 시 userId 저장.
 */
export async function POST(request: NextRequest) {
  let body: { sessionId?: string; setName?: string; answers?: AnswerIn[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '요청 형식 오류' }, { status: 400 })
  }

  const sessionId = String(body.sessionId ?? '').trim()
  const setName = String(body.setName ?? 'default').trim() || 'default'
  const answers = Array.isArray(body.answers) ? body.answers : []
  if (!sessionId) return NextResponse.json({ error: 'sessionId 필요' }, { status: 400 })
  if (answers.length === 0) return NextResponse.json({ error: '응답이 없습니다.' }, { status: 400 })

  try {
    await connectDB()

    // 문항 로드 (정답·태그는 서버에서만 확인)
    const ids = answers.map((a) => a.questionId).filter(Boolean)
    const questions = await DiagnosticQuestion.find({ _id: { $in: ids } }).lean()
    const qmap = new Map(
      (questions as Array<{ _id: unknown; choices?: Array<{ isCorrect?: boolean }>; tags?: string[] }>).map((q) => [String(q._id), q]),
    )

    // 채점 + 약점 태그
    const weak = new Set<string>()
    let score = 0
    const gradedAnswers = answers.map((a) => {
      const q = qmap.get(String(a.questionId))
      const correct = !!q?.choices?.[a.selected]?.isCorrect
      if (correct) score++
      else if (q?.tags) for (const t of q.tags) weak.add(t)
      return { questionId: String(a.questionId), selected: Number(a.selected), correct }
    })
    const weakTags = [...weak]

    // 추천: 약점 태그를 diagnosticTags 로 가진 모듈 (category → code 순)
    let recommendedModules: string[] = []
    if (weakTags.length > 0) {
      const mods = await CuratorModule.find({ isActive: true, diagnosticTags: { $in: weakTags } })
        .sort({ category: 1, code: 1 })
        .select('code')
        .lean()
      recommendedModules = (mods as Array<{ code?: string }>).map((m) => m.code ?? '').filter(Boolean)
    }

    const user = await getAuthUser()
    const result = await DiagnosticResult.create({
      sessionId,
      userId: user?.id,
      userEmail: user?.email,
      setName,
      answers: gradedAnswers,
      weakTags,
      recommendedModules,
      score,
      total: answers.length,
    })

    return NextResponse.json({
      success: true,
      resultId: String(result._id),
      score,
      total: answers.length,
      weakTags,
      recommendedModules,
    })
  } catch (e) {
    console.error('진단 처리 오류:', e)
    return NextResponse.json({ error: '진단 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
