/**
 * 조건영작배열(26년 5월 고3) 가격 일괄 조정.
 *
 * - 번호별: 문항당 800원 통일 (18~20번 무료)
 * - 난이도별: 5,200원 (정가 5,600)
 * - 풀세트: 10,800원 (정가 20,800)
 *
 *   npx tsx scripts/update-condition-writing-prices.ts
 *   npx tsx scripts/update-condition-writing-prices.ts --apply
 */
import { config } from "dotenv"
import mongoose from "mongoose"

config({ path: ".env.local" })

const APPLY = process.argv.includes("--apply")
const EXAM_TAG = "26년 5월"
const PRODUCT_TAG = "조건영작배열"
const FREE_NUMBER_TAGS = new Set(["18번", "19번", "20번"])

const NUMBER_PRICE = 800 // 번호별 통일 (4난이도 포함)

const DIFFICULTY_PRICE = 5200
const DIFFICULTY_ORIGINAL = 5600
const FULL_SET_PRICE = 10800
const FULL_SET_ORIGINAL = DIFFICULTY_PRICE * 4 // 20,800

function passagesFromTags(tags: string[]): number | null {
  if (tags.includes("41-42번")) return 2
  if (tags.includes("43-45번")) return 3
  const single = tags.find((t) => /^\d+번$/.test(t))
  if (single) return 1
  return null
}

function classify(
  title: string,
  tags: string[]
): "free-number" | "paid-number" | "difficulty" | "full-set" | "skip" {
  if (!tags.includes(PRODUCT_TAG) || !tags.includes(EXAM_TAG)) return "skip"
  if (tags.includes("전체") || title.includes("풀세트")) return "full-set"
  if (tags.includes("난이도별")) return "difficulty"
  const passages = passagesFromTags(tags)
  if (passages === null) return "skip"
  const numTag = tags.find((t) => /^\d+번$/.test(t))
  if (numTag && FREE_NUMBER_TAGS.has(numTag)) return "free-number"
  return "paid-number"
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI 없음")
    process.exit(1)
  }

  await mongoose.connect(uri)
  const col = mongoose.connection.collection("products")

  const docs = await col
    .find({ tags: { $all: [PRODUCT_TAG, EXAM_TAG] } })
    .toArray()

  console.log(`\n=== 조건영작배열 가격 조정 ${APPLY ? "[APPLY]" : "[DRY-RUN]"} ===\n`)
  console.log(`대상 ${docs.length}건\n`)

  let updated = 0
  for (const doc of docs) {
    const title = (doc.title as string) || ""
    const tags = (doc.tags as string[]) || []
    const kind = classify(title, tags)

    if (kind === "skip") continue

    let update: Record<string, unknown> = {}

    switch (kind) {
      case "free-number":
        update = { price: 0, isFree: true, originalPrice: NUMBER_PRICE }
        break
      case "paid-number":
        update = {
          price: NUMBER_PRICE,
          isFree: false,
          originalPrice: NUMBER_PRICE,
        }
        break
      case "difficulty":
        update = {
          price: DIFFICULTY_PRICE,
          isFree: false,
          originalPrice: DIFFICULTY_ORIGINAL,
        }
        break
      case "full-set":
        update = {
          price: FULL_SET_PRICE,
          isFree: false,
          originalPrice: FULL_SET_ORIGINAL,
        }
        break
    }

    const label = `${title} → ${JSON.stringify(update)}`
    if (APPLY) {
      await col.updateOne({ _id: doc._id }, { $set: update })
    }
    console.log(APPLY ? "✓" : "·", label)
    updated++
  }

  console.log(`\n${APPLY ? "적용" : "예정"}: ${updated}건`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
