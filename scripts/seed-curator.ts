/**
 * 그래머 큐레이터 시드 — 예시 모듈 8개 + 진단 문항 10개.
 *
 *   npx tsx scripts/seed-curator.ts            # dry-run (미리보기)
 *   npx tsx scripts/seed-curator.ts --apply    # 실제 반영
 *
 * - 모듈: code 기준 upsert (중복 없음, 재실행 시 갱신).
 * - 문항: set='default' 를 통째로 교체(재실행 시 시드 문항 초기화).
 * - pdfRef 는 비움(교재 PDF 업로드 후 어드민에서 연결).
 */
import { config } from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import CuratorModule from '../src/models/CuratorModule'
import DiagnosticQuestion from '../src/models/DiagnosticQuestion'

config({ path: path.resolve(process.cwd(), '.env.local') })
const APPLY = process.argv.includes('--apply')
const SET = 'default'

const MODULES = [
  { code: 'GC-101', category: '문장구조', title: '문장의 5형식', description: '모든 문장은 다섯 개의 뼈대 위에 선다. 주어와 동사가 만드는 기본 골격부터.', pages: 12, diagnosticTags: ['sentence-pattern'], order: 1 },
  { code: 'GC-102', category: '문장구조', title: '구와 절', description: '단어의 무리가 문장 속에서 맡는 역할 — 구와 절의 경계를 읽는 법.', pages: 10, diagnosticTags: ['phrase-clause'], order: 2 },
  { code: 'GC-201', category: '시제', title: '기본 시제: 현재·과거·미래', description: '시간을 문법에 새기는 세 개의 좌표.', pages: 10, diagnosticTags: ['tense-basic'], order: 1 },
  { code: 'GC-202', category: '시제', title: '완료 시제', description: '이미 일어난 일이 지금에 드리우는 그림자 — 완료의 감각.', pages: 12, diagnosticTags: ['perfect-tense'], order: 2 },
  { code: 'GC-301', category: '준동사', title: 'to부정사', description: '동사가 명사·형용사·부사로 변신하는 첫 번째 방식.', pages: 14, diagnosticTags: ['to-infinitive'], order: 1 },
  { code: 'GC-302', category: '준동사', title: '동명사와 분사', description: '-ing와 -ed가 문장에서 맡는 두 얼굴.', pages: 14, diagnosticTags: ['gerund-participle'], order: 2 },
  { code: 'GC-401', category: '관계사', title: '관계대명사', description: '두 문장을 하나로 잇는 다리, who·which·that.', pages: 12, diagnosticTags: ['relative-pronoun'], order: 1 },
  { code: 'GC-501', category: '접속사', title: '등위·종속 접속사', description: '생각과 생각을 잇는 접속의 문법.', pages: 10, diagnosticTags: ['conjunction'], order: 1 },
]

const q = (prompt: string, tags: string[], correct: number, choices: string[], order: number) => ({
  prompt, tags, difficulty: 1, setName: SET, order, isActive: true,
  choices: choices.map((text, i) => ({ text, isCorrect: i === correct })),
})

const QUESTIONS = [
  q('다음 중 4형식(수여동사) 문장은?', ['sentence-pattern'], 0, ['She gave me a book.', 'He runs fast.', 'They are students.', 'I like coffee.'], 1),
  q("빈칸에 알맞은 것은? 'The news made her ___.'", ['sentence-pattern'], 0, ['happy', 'happily', 'happiness', 'to happy'], 2),
  q("밑줄 친 부분의 역할은? 'I know [that he is honest].'", ['phrase-clause'], 0, ['명사절(목적어)', '형용사절', '부사절', '전치사구'], 3),
  q("알맞은 시제는? 'Water ___ at 100°C.'", ['tense-basic'], 0, ['boils', 'boiled', 'will boil', 'is boiling'], 4),
  q("빈칸: 'I ___ here since 2010.'", ['perfect-tense'], 0, ['have lived', 'live', 'lived', 'am living'], 5),
  q("빈칸: 'She wants ___ a doctor.'", ['to-infinitive'], 0, ['to be', 'be', 'being', 'been'], 6),
  q("빈칸: 'I enjoy ___ books.'", ['gerund-participle'], 0, ['reading', 'to read', 'read', 'readed'], 7),
  q("빈칸: 'This is the man ___ helped me.'", ['relative-pronoun'], 0, ['who', 'which', 'whose', 'whom'], 8),
  q("빈칸: '___ it was raining, we went out.'", ['conjunction'], 0, ['Although', 'Because', 'So', 'And'], 9),
  q("빈칸: 'It is important ___ hard.'", ['to-infinitive'], 0, ['to study', 'studying', 'study', 'studied'], 10),
]

async function main() {
  console.log(`\n=== 그래머 큐레이터 시드 ${APPLY ? '[APPLY]' : '[DRY-RUN]'} ===`)
  console.log(`모듈 ${MODULES.length}개 / 진단문항 ${QUESTIONS.length}개 (set='${SET}')`)
  const tagUniverse = new Set(MODULES.flatMap((m) => m.diagnosticTags))
  const qTags = new Set(QUESTIONS.flatMap((x) => x.tags))
  const orphan = [...qTags].filter((t) => !tagUniverse.has(t))
  console.log(`태그: 모듈 ${tagUniverse.size}종, 문항 ${qTags.size}종${orphan.length ? ` / ⚠ 매칭 안되는 문항태그: ${orphan.join(', ')}` : ' / 전부 매칭 OK'}`)
  for (const m of MODULES) console.log(`  · ${m.code} [${m.category}] ${m.title} → tags=[${m.diagnosticTags.join(',')}]`)

  if (!APPLY) { console.log('\ndry-run 종료. 실제 반영은 --apply.'); return }

  const uri = process.env.MONGODB_URI
  if (!uri) { console.error('MONGODB_URI 없음'); process.exit(1) }
  await mongoose.connect(uri)

  let up = 0
  for (const m of MODULES) {
    await CuratorModule.updateOne({ code: m.code }, { $set: m }, { upsert: true })
    up++
  }
  const del = await DiagnosticQuestion.deleteMany({ setName: SET })
  await DiagnosticQuestion.insertMany(QUESTIONS)

  console.log(`\n✓ 모듈 upsert ${up}개 / 문항 set='${SET}' ${del.deletedCount}개 삭제 후 ${QUESTIONS.length}개 재삽입`)
  await mongoose.disconnect()
}

main().catch(async (e) => { console.error('오류:', e); await mongoose.disconnect().catch(() => {}); process.exit(1) })
