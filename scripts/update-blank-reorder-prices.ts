/**
 * 빈칸재배열형(주제)/(어법) 상품 가격을 지문당 200원 기준으로 맞춤.
 * - 단일 지문: 200원
 * - 41-42번(2지문): 400원
 * - 합본: 20지문 × 200원 = 4000원 (합본 지문 수 변경 시 이 스크립트 조정)
 *
 *   npx tsx scripts/update-blank-reorder-prices.ts
 */
import { config } from "dotenv"
import path from "path"
import mongoose from "mongoose"

config({ path: path.resolve(process.cwd(), ".env.local") })

const TAGS = ["빈칸재배열형(주제)", "빈칸재배열형(어법)"] as const

function priceForTitle(title: string): number {
  if (title.includes("합본")) return 4000
  if (title.includes("41-42")) return 400
  return 200
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
    .find({ tags: { $in: [...TAGS] } })
    .toArray()

  let n = 0
  for (const doc of docs) {
    const title = (doc as { title?: string }).title || ""
    const price = priceForTitle(title)
    await col.updateOne(
      { _id: (doc as { _id: unknown })._id },
      { $set: { price, isFree: false } }
    )
    n++
    console.log(`✓ ${title} → ${price}원`)
  }

  console.log(`\n완료: ${n}건`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
