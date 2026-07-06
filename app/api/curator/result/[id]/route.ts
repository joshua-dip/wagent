import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import connectDB from '@/lib/db'
import DiagnosticResult from '@/models/DiagnosticResult'
import CuratorModule from '@/models/CuratorModule'
import { serializeModules } from '@/lib/curator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 진단 결과 + 추천 모듈(구매정보 포함). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: '유효하지 않은 결과 ID입니다.' }, { status: 400 })
    }
    await connectDB()
    const result = await DiagnosticResult.findById(id).lean() as {
      _id: unknown; score?: number; total?: number; weakTags?: string[]; recommendedModules?: string[]; setName?: string; createdAt?: Date
    } | null
    if (!result) return NextResponse.json({ error: '결과를 찾을 수 없습니다.' }, { status: 404 })

    const codes = Array.isArray(result.recommendedModules) ? result.recommendedModules : []
    const mods = codes.length
      ? await CuratorModule.find({ code: { $in: codes }, isActive: true }).lean()
      : []
    let modules = await serializeModules(mods as Array<Record<string, unknown>>)
    // 추천 저장 순서 유지
    const orderIdx = new Map(codes.map((c, i) => [c, i]))
    modules = modules.sort((a, b) => (orderIdx.get(a.code) ?? 999) - (orderIdx.get(b.code) ?? 999))

    return NextResponse.json({
      result: {
        score: result.score ?? 0,
        total: result.total ?? 0,
        weakTags: result.weakTags ?? [],
        recommendedModules: codes,
        setName: result.setName ?? 'default',
        createdAt: result.createdAt,
      },
      modules,
    })
  } catch (e) {
    console.error('진단 결과 조회 오류:', e)
    return NextResponse.json({ error: '결과를 불러올 수 없습니다.' }, { status: 500 })
  }
}
