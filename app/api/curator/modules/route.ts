import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import CuratorModule from '@/models/CuratorModule'
import { serializeModules } from '@/lib/curator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 전체 모듈 라이브러리 (청구기호순) + 카테고리 목록. ?category= 필터. */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const category = request.nextUrl.searchParams.get('category')?.trim()
    const filter: Record<string, unknown> = { isActive: true }
    if (category) filter.category = category
    const mods = await CuratorModule.find(filter).sort({ code: 1 }).lean()
    const modules = await serializeModules(mods as Array<Record<string, unknown>>)
    const categories = (await CuratorModule.distinct('category', { isActive: true })) as string[]
    return NextResponse.json({ modules, categories: categories.sort() })
  } catch (e) {
    console.error('모듈 목록 조회 오류:', e)
    return NextResponse.json({ error: '모듈을 불러올 수 없습니다.' }, { status: 500 })
  }
}
