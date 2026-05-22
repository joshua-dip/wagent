/**
 * 26년 5월 고3 조건영작배열 풀세트/난이도별 originalPrice 조정.
 *   풀세트: originalPrice 13,500 (10,800 selling → 20% off)
 *   난이도별: originalPrice 5,800 (5,200 selling → ~10% off)
 *
 *   npx tsx scripts/update-26may-discount.ts
 */
import { config } from "dotenv"
import path from "path"
import mongoose from "mongoose"

config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI 없음")
    process.exit(1)
  }
  await mongoose.connect(uri)
  const col = mongoose.connection.collection("products")

  const bundle = await col.updateMany(
    { tags: { $all: ["고3", "26년 5월", "조건영작배열", "전체"] } },
    { $set: { price: 14000, originalPrice: 17600 } }
  )
  console.log(`풀세트: ${bundle.modifiedCount}건 갱신 → 14,000 / 17,600 (20% off)`)

  const diff = await col.updateMany(
    { tags: { $all: ["고3", "26년 5월", "조건영작배열", "난이도별"] } },
    { $set: { price: 3900, originalPrice: 4400 } }
  )
  console.log(`난이도별: ${diff.modifiedCount}건 갱신 → 3,900 / 4,400 (11% off)`)

  await mongoose.disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
