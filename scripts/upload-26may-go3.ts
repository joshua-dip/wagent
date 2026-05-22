/**
 * 26년 5월 고3 영어모의고사 조건영작배열 일괄 업로드.
 *
 * 사용법:
 *   npx tsx scripts/upload-26may-go3.ts            # dry-run
 *   npx tsx scripts/upload-26may-go3.ts --apply    # 실제 업로드
 */

import { config } from "dotenv"
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")

const SOURCE_DIR =
  "/Users/goshua/JCstars Dropbox/박준규/10모의고사/영어/03_고3/2026학년도 5월 고3 영어모의고사/조건영작배열"

const BASE_TAGS = ["고3", "26년 5월", "조건영작배열"] as const

// 번호별: 18~40번은 단일 지문, 41~42번은 2지문, 43~45번은 3지문.
// PDF에 4난이도 포함. 번호별 문항당 800원 통일. 18~20번은 무료.
const FREE_NUMBERS = new Set(["18번", "19번", "20번"])
const NUMBER_PRICE = 800

const NUM_FILES: Array<{ filename: string; number: string; passages: number }> = [
  ...Array.from({ length: 23 }, (_, i) => {
    const n = 18 + i
    return { filename: `26년 5월 고3 영어모의고사 ${n}번.pdf`, number: `${n}번`, passages: 1 }
  }),
  { filename: `26년 5월 고3 영어모의고사 41~42번.pdf`, number: "41-42번", passages: 2 },
  { filename: `26년 5월 고3 영어모의고사 43~45번.pdf`, number: "43-45번", passages: 3 },
]

// 난이도별: 22지문(18-20번 무료 제외) × 200원 = 4,400원 정가, 11% off → 3,900원
const DIFFICULTY_PRICE = 3900
const DIFFICULTY_ORIGINAL = 4400

const DIFFICULTY_FILES: Array<{ filename: string; level: string }> = [
  { filename: "기본난도.pdf", level: "기본난도" },
  { filename: "중난도.pdf", level: "중난도" },
  { filename: "고난도.pdf", level: "고난도" },
  { filename: "최고난도.pdf", level: "최고난도" },
]

const ALL_BUNDLE = {
  filename: "26년 5월 고3 영어모의고사_조건영작배열_전번호.pdf",
  // 18~20번 무료 제외 22지문 × 800원 = 17,600원 정가, 20% off → 14,000원
  price: 14000,
  originalPrice: 17600,
}

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

async function uploadToS3(buffer: Buffer, fileName: string): Promise<string> {
  const ts = Date.now()
  const safe = fileName.replace(/[^a-zA-Z0-9가-힣_.-]/g, "_")
  const key = `products/${ts}_${safe}`
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
      Metadata: {
        "original-name": Buffer.from(fileName, "utf8").toString("base64"),
        "uploaded-by": "PAYPERIC",
        "upload-date": new Date().toISOString(),
      },
    })
  )
  return key
}

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    category: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    author: { type: String, required: true, trim: true },
    authorId: { type: String, required: true },
    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    filePath: { type: String, required: true },
    thumbnail: { type: String },
    downloadCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFree: { type: Boolean, default: false },
  },
  { timestamps: true, strict: false }
)
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema)

interface UploadEntry {
  absPath: string
  title: string
  description: string
  price: number
  originalPrice?: number
  isFree?: boolean
  tags: string[]
}

function buildEntries(): UploadEntry[] {
  const entries: UploadEntry[] = []

  for (const item of NUM_FILES) {
    const isFree = FREE_NUMBERS.has(item.number)
    entries.push({
      absPath: path.join(SOURCE_DIR, "번호별", item.filename),
      title: `26년 5월 고3 영어모의고사 ${item.number} 조건영작배열`,
      description: `26년 5월 고3 영어모의고사 ${item.number} 조건영작배열 (기본·중·고·최고난도 4단계 + 정답·해설).`,
      price: isFree ? 0 : NUMBER_PRICE,
      originalPrice: NUMBER_PRICE,
      isFree,
      tags: [...BASE_TAGS, item.number],
    })
  }

  for (const item of DIFFICULTY_FILES) {
    entries.push({
      absPath: path.join(SOURCE_DIR, "난이도별", item.filename),
      title: `26년 5월 고3 영어모의고사 조건영작배열 ${item.level} 전체`,
      description: `26년 5월 고3 영어모의고사 조건영작배열 ${item.level} 전체 25문항 묶음 (18~45번).`,
      price: DIFFICULTY_PRICE,
      originalPrice: DIFFICULTY_ORIGINAL,
      tags: [...BASE_TAGS, item.level, "난이도별"],
    })
  }

  entries.push({
    absPath: path.join(SOURCE_DIR, ALL_BUNDLE.filename),
    title: `26년 5월 고3 영어모의고사 조건영작배열 전체 풀세트`,
    description: `26년 5월 고3 영어모의고사 조건영작배열 전 문항 (18~45번) × 전 난이도 (기본·중·고·최고) 풀세트. 25문항 × 4난이도.`,
    price: ALL_BUNDLE.price,
    originalPrice: ALL_BUNDLE.originalPrice,
    tags: [...BASE_TAGS, "전체"],
  })

  return entries
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI 없음")
    process.exit(1)
  }

  const entries = buildEntries()
  console.log(`\n=== 26년 5월 고3 조건영작배열 업로드 ${APPLY ? "[APPLY]" : "[DRY-RUN]"} ===\n`)
  console.log(`총 ${entries.length}건\n`)

  let missing = 0
  for (const e of entries) {
    const ok = fs.existsSync(e.absPath)
    if (!ok) missing++
    console.log(
      `  ${ok ? "OK " : "X  "} ${e.title} | ${e.price}원 | tags=[${e.tags.join(", ")}]`
    )
    if (!ok) console.log(`       → 누락: ${e.absPath}`)
  }

  if (missing > 0) {
    console.error(`\n${missing}개 파일 누락. 중단.`)
    process.exit(1)
  }

  if (!APPLY) {
    console.log("\ndry-run 종료. 실제 업로드는 --apply.")
    return
  }

  await mongoose.connect(uri)

  let created = 0
  let failed = 0
  for (const e of entries) {
    try {
      const dup = await Product.findOne({ title: e.title })
      if (dup) {
        console.log(`SKIP ${e.title} (이미 존재)`)
        continue
      }
      const buf = fs.readFileSync(e.absPath)
      const baseName = path.basename(e.absPath)
      const s3Key = await uploadToS3(buf, baseName)

      await Product.create({
        title: e.title,
        description: e.description,
        price: e.price,
        originalPrice: e.originalPrice,
        category: "grade3-material",
        tags: e.tags,
        author: "PAYPERIC",
        authorId: "admin",
        fileName: path.basename(s3Key),
        originalFileName: baseName,
        fileSize: buf.length,
        filePath: s3Key,
        isFree: e.isFree ?? false,
      })
      created++
      console.log(`OK  ${e.title} (${(buf.length / 1024).toFixed(0)} KB)`)
    } catch (err) {
      failed++
      console.error(`FAIL ${e.title}:`, (err as Error).message)
    }
  }

  console.log(`\n생성: ${created} / 실패: ${failed}`)
  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error("오류:", err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
