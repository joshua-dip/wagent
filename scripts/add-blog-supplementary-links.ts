/**
 * '조건영작배열' 블로그 글 하단에 "다른 부교재 구매 링크"(강별 접기) 섹션 추가/갱신.
 *
 *   npx tsx scripts/add-blog-supplementary-links.ts                 # dry-run (미리보기)
 *   npx tsx scripts/add-blog-supplementary-links.ts --apply         # 실제 반영
 *   npx tsx scripts/add-blog-supplementary-links.ts --apply --slug other-slug
 *
 * - 링크 목록: scripts/data/solvook-supplementary-links.txt (【강】 + "라벨 / URL")
 * - <details>/<summary> 네이티브 접기 사용 (블로그는 sanitized HTML 을 그대로 렌더).
 * - 멱등: <section data-block="solvook-supplementary"> 블록을 매번 교체 → 재실행 시 갱신.
 * - 주의: 이 섹션은 관리자 TipTap 에디터로 글을 다시 저장하면 사라질 수 있으니
 *   링크가 바뀌면 txt 갱신 후 이 스크립트를 다시 실행하세요.
 */
import { config } from "dotenv"
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import BlogPost from "../src/models/BlogPost"
import { sanitizeHtml } from "../src/lib/sanitizeHtml"

config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")
const slugIdx = process.argv.indexOf("--slug")
const SLUG = slugIdx >= 0 ? process.argv[slugIdx + 1] : "conditional-writing-arrangement"
const BLOCK = "solvook-supplementary"
const DATA_PATH = path.resolve(process.cwd(), "scripts/data/solvook-supplementary-links.txt")

interface Item { num: string; url: string }
interface Section { name: string; items: Item[] }

function parse(raw: string): Section[] {
  const sections: Section[] = []
  let cur: Section | null = null
  for (const line of raw.split("\n")) {
    const t = line.trim()
    if (!t) continue
    const h = t.match(/^【(.+?)】$/)
    if (h) { cur = { name: h[1].trim(), items: [] }; sections.push(cur); continue }
    const idx = t.indexOf(" / ")
    if (idx === -1 || !cur) continue
    const labelFull = t.slice(0, idx).trim()
    const url = t.slice(idx + 3).trim()
    if (!/^https?:\/\//.test(url)) continue
    const num = labelFull.split(/\s+/).pop() || labelFull
    cur.items.push({ num, url })
  }
  return sections.filter((s) => s.items.length > 0)
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function buildSection(sections: Section[]): string {
  const total = sections.reduce((n, s) => n + s.items.length, 0)
  const details = sections
    .map((s) => {
      const lis = s.items
        .map(
          (it) =>
            `<li style="margin:5px 0;"><a href="${it.url}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ${esc(it.num)}</a></li>`,
        )
        .join("")
      return (
        `<details style="margin:10px 0;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">` +
        `<summary style="cursor:pointer;padding:11px 14px;font-weight:700;color:#0f172a;background:#f8fafc;border-radius:10px;">` +
        `${esc(s.name)} <span style="color:#64748b;font-weight:500;font-size:13px;">· ${s.items.length}문항</span></summary>` +
        `<ul style="margin:0;padding:8px 16px 14px 32px;">${lis}</ul></details>`
      )
    })
    .join("\n")

  return (
    `<section data-block="${BLOCK}" style="margin-top:40px;padding-top:24px;border-top:2px solid #e2e8f0;">` +
    `<h2>📚 다른 부교재도 아래 링크에서 구매할 수 있어요</h2>` +
    `<p style="color:#475569;font-size:14px;line-height:1.7;">「얇빠기본 조건영작배열」 강별 문항을 솔북(Solvook)에서 낱개로도 구매할 수 있습니다. 원하는 강을 펼쳐 문항을 선택하세요. <span style="color:#94a3b8;">(총 ${sections.length}강 · ${total}문항)</span></p>` +
    details +
    `</section>`
  )
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`데이터 파일 없음: ${DATA_PATH}\n(프로젝트 루트에서 실행하세요)`)
    process.exit(1)
  }
  const sections = parse(fs.readFileSync(DATA_PATH, "utf8"))
  if (sections.length === 0) {
    console.error("파싱된 링크가 없습니다. 데이터 파일을 확인하세요.")
    process.exit(1)
  }
  const total = sections.reduce((n, s) => n + s.items.length, 0)
  console.log(`\n=== 블로그 부교재 링크 섹션 ${APPLY ? "[APPLY]" : "[DRY-RUN]"} ===`)
  console.log(`파싱: ${sections.length}강 / ${total}문항`)
  for (const s of sections) console.log(`  · ${s.name}: ${s.items.length}문항`)

  const newSection = sanitizeHtml(buildSection(sections))

  const uri = process.env.MONGODB_URI
  if (!uri) { console.error("MONGODB_URI 없음"); process.exit(1) }
  await mongoose.connect(uri)

  const post = await BlogPost.findOne({ slug: SLUG })
  if (!post) {
    const all = await BlogPost.find({}, { slug: 1, title: 1 }).lean()
    console.error(`\nslug "${SLUG}" 글을 찾을 수 없습니다. 존재하는 글:`)
    for (const p of all as Array<{ slug?: string; title?: string }>) console.error(`  - ${p.slug}  (${p.title})`)
    await mongoose.disconnect()
    process.exit(1)
  }

  const before = String(post.content || "")
  const existingRe = new RegExp(`<section data-block="${BLOCK}"[\\s\\S]*?</section>`, "g")
  const hadBlock = existingRe.test(before)
  const stripped = before.replace(existingRe, "").trimEnd()
  const after = stripped + "\n" + newSection

  console.log(`\n기존 섹션 존재: ${hadBlock ? "있음 → 교체" : "없음 → 추가"}`)
  console.log(`본문 길이: ${before.length} → ${after.length}`)
  console.log(`\n--- 추가될 섹션 미리보기(앞 500자) ---\n${newSection.slice(0, 500)}\n...`)

  if (!APPLY) {
    console.log("\ndry-run 종료. 실제 반영은 --apply.")
    await mongoose.disconnect()
    return
  }

  post.content = after
  await post.save()
  console.log(`\n✓ 반영 완료 — /blog/${SLUG} 하단에 ${sections.length}강 접기 섹션 추가.`)
  await mongoose.disconnect()
}

main().catch(async (e) => {
  console.error("오류:", e)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
