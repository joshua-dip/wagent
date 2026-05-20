/**
 * 모든 Product 문서 + 연관된 S3 객체 삭제.
 * - DB: MongoDB Product hard delete (filter 없음)
 * - S3: filePath / hwpFilePath / thumbnail 키 삭제
 *
 * 사용법:
 *   npx tsx scripts/delete-all-products.ts            # dry-run (변경 없음)
 *   npx tsx scripts/delete-all-products.ts --apply    # 실제 삭제
 */

import { config } from "dotenv"
import path from "path"
import mongoose from "mongoose"
import {
  S3Client,
  DeleteObjectCommand,
  type DeleteObjectCommandOutput,
} from "@aws-sdk/client-s3"

config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")

const s3 = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: (process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
    secretAccessKey:
      (process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
  },
})

const BUCKET =
  process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || "wagent-products"

async function deleteS3Key(key: string): Promise<DeleteObjectCommandOutput> {
  return s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    filePath: String,
    hwpFilePath: String,
    thumbnail: String,
    isFree: Boolean,
  },
  { strict: false, timestamps: true }
)
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema)

const PurchaseSchema = new mongoose.Schema(
  { productId: String },
  { strict: false }
)
const Purchase =
  mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema)

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI 환경 변수가 없습니다.")
    process.exit(1)
  }

  console.log(`\n=== 전체 Product 삭제 ${APPLY ? "[APPLY]" : "[DRY-RUN]"} ===\n`)
  console.log(`bucket: ${BUCKET}\n`)

  await mongoose.connect(uri)

  const products = await Product.find({})
    .select("_id title filePath hwpFilePath thumbnail")
    .lean()

  if (products.length === 0) {
    console.log("대상 상품이 없습니다.")
    await mongoose.disconnect()
    return
  }

  console.log(`대상 상품: ${products.length}건`)

  const s3Keys: string[] = []
  for (const p of products) {
    if (p.filePath) s3Keys.push(p.filePath)
    if (p.hwpFilePath) s3Keys.push(p.hwpFilePath)
    if (p.thumbnail) s3Keys.push(p.thumbnail)
  }
  console.log(`삭제 대상 S3 키: ${s3Keys.length}개\n`)

  for (const p of products.slice(0, 10)) {
    console.log(`  - ${String(p._id)} | ${p.title}`)
  }
  if (products.length > 10) {
    console.log(`  ... 외 ${products.length - 10}건`)
  }

  const ids = products.map((p) => String(p._id))
  const purchaseRefs = await Purchase.countDocuments({ productId: { $in: ids } })
  console.log(`\nPurchase에서 참조 중: ${purchaseRefs}건`)
  if (purchaseRefs > 0) {
    console.log(
      "  참조된 구매기록은 그대로 두며, /my/purchases에서 깨진 항목으로 보일 수 있습니다."
    )
  }

  if (!APPLY) {
    console.log("\ndry-run 종료. 실제 삭제하려면 --apply 옵션.")
    await mongoose.disconnect()
    return
  }

  console.log("\nS3 삭제 시작...")
  let s3Ok = 0
  let s3Fail = 0
  for (const key of s3Keys) {
    try {
      await deleteS3Key(key)
      s3Ok++
    } catch (err) {
      s3Fail++
      console.error(`  S3 실패: ${key}`, (err as Error).message)
    }
  }
  console.log(`  완료: ${s3Ok} 성공 / ${s3Fail} 실패`)

  console.log("\nDB 삭제 시작...")
  const result = await Product.deleteMany({})
  console.log(`  완료: ${result.deletedCount}건 삭제`)

  await mongoose.disconnect()
  console.log("\n완료.\n")
}

main().catch(async (err) => {
  console.error("스크립트 오류:", err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
