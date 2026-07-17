/**
 * 리체움(lyceum) 문법 자가진단 문항을 payperic(wagent) 큐레이터 진단으로 이관.
 *   lyceum.diagnosis_grammar_problems  →  wagent.diagnosticquestions (DiagnosticQuestion)
 *
 * 매핑: prompt=[instruction, question] · choices=options(정답=answer ①~④) ·
 *       tags=[대단원] (약점=대단원 채점) · setName='중등-<vocabLevel>' | '고등-<vocabLevel>' · order=topicNo
 *
 *   npx tsx scripts/import-grammar-diagnosis.ts            # dry-run (소스 집계만)
 *   npx tsx scripts/import-grammar-diagnosis.ts --apply    # 실제 이관 (기존 중등-/고등- 세트 교체)
 *
 * 소스 DB 접속: env LYCEUM_MONGODB_URI, 없으면 ../next-quiz-feedback/.env.local 의 MONGODB_URI.
 * 대상 DB 접속: payperic .env.local 의 MONGODB_URI (wagent).
 */
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { MongoClient } from 'mongodb'

config({ path: path.resolve(process.cwd(), '.env.local') })
const APPLY = process.argv.includes('--apply')
const SYMBOLS = ['①', '②', '③', '④']
const SRC_COLLECTION = 'diagnosis_grammar_problems'

function readLyceumUri(): string | null {
  if (process.env.LYCEUM_MONGODB_URI) return process.env.LYCEUM_MONGODB_URI
  const p = '/Users/goshua/next-quiz-feedback/.env.local'
  if (!fs.existsSync(p)) return null
  const m = fs.readFileSync(p, 'utf8').match(/^\s*MONGODB_URI\s*=\s*(.+)\s*$/m)
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null
}

interface SrcDoc {
  topicNo?: number; topic?: string; 대단원?: string; vocabLevel?: string; isHigh?: boolean
  instruction?: string; question?: string; options?: string[]; answer?: string
}

function mapDoc(d: SrcDoc) {
  const options = Array.isArray(d.options) ? d.options : []
  const correct = SYMBOLS.indexOf(String(d.answer || ''))
  const stage = d.isHigh ? '고등' : '중등'
  const prompt = [d.instruction, d.question].filter(Boolean).join('\n').trim()
  return {
    prompt,
    choices: options.map((text, i) => ({ text: String(text), isCorrect: i === correct })),
    tags: [d.대단원].filter(Boolean) as string[],
    difficulty: 1,
    setName: `${stage}-${d.vocabLevel || ''}`.replace(/-$/, ''),
    order: typeof d.topicNo === 'number' ? d.topicNo : 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

async function main() {
  const srcUri = readLyceumUri()
  const dstUri = process.env.MONGODB_URI
  if (!srcUri) { console.error('소스 URI 없음 (LYCEUM_MONGODB_URI 또는 ../next-quiz-feedback/.env.local)'); process.exit(1) }
  if (!dstUri) { console.error('대상 MONGODB_URI 없음 (.env.local)'); process.exit(1) }

  const srcClient = new MongoClient(srcUri)
  await srcClient.connect()
  const src = srcClient.db('lyceum').collection<SrcDoc>(SRC_COLLECTION)

  const docs = await src.find({}).toArray()
  const mapped = docs.map(mapDoc).filter((m) => m.prompt && m.choices.length >= 2 && m.choices.some((c) => c.isCorrect))

  // 대단원별 모듈 자동 생성 (diagnosticTags=대단원 → 진단 약점→추천 연결). code: GM-NN(중등)/GH-NN(고등)
  const unitMap = new Map<string, { stage: string; 대단원: string; order: number }>()
  for (const d of docs) {
    const bigUnit = (d.대단원 || '').trim()
    if (!bigUnit) continue
    const stage = d.isHigh ? '고등' : '중등'
    const order = typeof d.topicNo === 'number' ? d.topicNo : 9999
    const key = `${stage}|${bigUnit}`
    const cur = unitMap.get(key)
    if (!cur || order < cur.order) unitMap.set(key, { stage, 대단원: bigUnit, order })
  }
  const modules: Record<string, unknown>[] = []
  for (const [stage, prefix] of [['중등', 'GM'], ['고등', 'GH']] as const) {
    const arr = [...unitMap.values()].filter((u) => u.stage === stage).sort((a, b) => a.order - b.order)
    arr.forEach((u, i) => {
      modules.push({
        code: `${prefix}-${String(i + 1).padStart(2, '0')}`,
        category: stage,
        title: u.대단원,
        description: `${stage} 문법 · ${u.대단원}`,
        pages: 0,
        diagnosticTags: [u.대단원],
        order: u.order,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })
  }

  // 집계
  const bySet = new Map<string, number>()
  for (const m of mapped) bySet.set(m.setName, (bySet.get(m.setName) || 0) + 1)
  console.log(`\n=== 문법 진단 이관 ${APPLY ? '[APPLY]' : '[DRY-RUN]'} ===`)
  console.log(`소스 ${docs.length}건 → 유효 ${mapped.length}건 (정답 없음/선택지 부족 제외)`)
  ;[...bySet.entries()].sort().forEach(([s, n]) => console.log(`  · ${s}: ${n}문항`))
  const tags = new Set(mapped.flatMap((m) => m.tags))
  console.log(`대단원 태그 종류: ${tags.size}`)
  console.log(`자동생성 대단원 모듈: ${modules.length}개 (중등 ${modules.filter((m) => m.category === '중등').length} · 고등 ${modules.filter((m) => m.category === '고등').length})`)

  if (!APPLY) { console.log('\ndry-run 종료. 실제 이관은 --apply.'); await srcClient.close(); return }

  const dstClient = new MongoClient(dstUri)
  await dstClient.connect()
  const dst = dstClient.db('wagent').collection('diagnosticquestions')
  // 기존 이관분(중등-/고등- 세트)만 교체
  const del = await dst.deleteMany({ setName: { $regex: '^(중등|고등)-' } })
  const ins = mapped.length ? await dst.insertMany(mapped) : { insertedCount: 0 }
  console.log(`\n✓ 진단 문항: 기존 이관분 ${del.deletedCount} 삭제 → ${ins.insertedCount} 삽입`)

  // 대단원 모듈 (자동생성분 GM-/GH- 만 교체, 수기 모듈 GC- 등은 보존)
  const modCol = dstClient.db('wagent').collection('curatormodules')
  const delM = await modCol.deleteMany({ code: { $regex: '^(GM|GH)-' } })
  const insM = modules.length ? await modCol.insertMany(modules) : { insertedCount: 0 }
  console.log(`✓ 대단원 모듈: 기존 자동생성분 ${delM.deletedCount} 삭제 → ${insM.insertedCount} 생성`)

  await Promise.all([srcClient.close(), dstClient.close()])
}

main().catch(async (e) => { console.error('오류:', e); process.exit(1) })
