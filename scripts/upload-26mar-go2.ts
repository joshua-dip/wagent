/**
 * 26년 3월 고2 영어모의고사 조건영작배열 일괄 업로드.
 *
 * 사용법:
 *   npx tsx scripts/upload-26mar-go2.ts            # dry-run
 *   npx tsx scripts/upload-26mar-go2.ts --apply    # 실제 업로드
 */

import { config } from "dotenv"
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import type archiverType from "archiver"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const archiver = require("archiver") as typeof archiverType

config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")

const NUM_DIR = "/Users/goshua/Downloads/26년 3월 고2 영어모의고사_번호별"
const DIFF_DIR = "/Users/goshua/Downloads/26년 3월 고2 영어모의고사_난도별"

const PREFIX = "26년 3월 고2 영어모의고사"
const BASE_TAGS = ["고2", "26년 3월", "조건영작배열"] as const

const FREE_NUMBERS = new Set(["18번", "19번", "20번"])
const NUMBER_PRICE = 800

const NUM_FILES: Array<{ filename: string; number: string }> = [
  ...Array.from({ length: 23 }, (_, i) => {
    const n = 18 + i
    return { filename: `${PREFIX} ${n}번.pdf`, number: `${n}번` }
  }),
  { filename: `${PREFIX} 41~42번.pdf`, number: "41-42번" },
  { filename: `${PREFIX} 43~45번.pdf`, number: "43-45번" },
]

const DIFFICULTY_PRICE = 3900
const DIFFICULTY_ORIGINAL = 4400

const DIFFICULTY_FILES: Array<{ filename: string; level: string }> = [
  { filename: "기본난도.pdf", level: "기본난도" },
  { filename: "중난도.pdf", level: "중난도" },
  { filename: "고난도.pdf", level: "고난도" },
  { filename: "최고난도.pdf", level: "최고난도" },
]

const FULLSET = {
  title: `${PREFIX} 조건영작배열 전체 풀세트`,
  zipName: `${PREFIX}_조건영작배열_풀세트.zip`,
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
      ContentType: fileName.endsWith(".zip")
        ? "application/zip"
        : "application/pdf",
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

interface ZipEntry {
  absPath: string
  zipPath: string
}

function buildEntries(): UploadEntry[] {
  const entries: UploadEntry[] = []

  for (const item of NUM_FILES) {
    const isFree = FREE_NUMBERS.has(item.number)
    entries.push({
      absPath: path.join(NUM_DIR, item.filename),
      title: `${PREFIX} ${item.number} 조건영작배열`,
      description: `${PREFIX} ${item.number} 조건영작배열 (기본·중·고·최고난도 4단계 + 정답·해설).`,
      price: isFree ? 0 : NUMBER_PRICE,
      originalPrice: NUMBER_PRICE,
      isFree,
      tags: [...BASE_TAGS, item.number],
    })
  }

  for (const item of DIFFICULTY_FILES) {
    entries.push({
      absPath: path.join(DIFF_DIR, item.filename),
      title: `${PREFIX} 조건영작배열 ${item.level} 전체`,
      description: `${PREFIX} 조건영작배열 ${item.level} 전체 25문항 묶음 (18~45번).`,
      price: DIFFICULTY_PRICE,
      originalPrice: DIFFICULTY_ORIGINAL,
      tags: [...BASE_TAGS, item.level, "난이도별"],
    })
  }

  return entries
}

function collectZipEntries(): ZipEntry[] {
  const entries: ZipEntry[] = []
  for (const f of DIFFICULTY_FILES) {
    entries.push({
      absPath: path.join(DIFF_DIR, f.filename),
      zipPath: `난이도별/${f.filename}`,
    })
  }
  for (const f of NUM_FILES) {
    entries.push({
      absPath: path.join(NUM_DIR, f.filename),
      zipPath: `번호별/${f.filename}`,
    })
  }
  return entries
}

function buildZipBuffer(entries: ZipEntry[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { store: true })
    const chunks: Buffer[] = []
    archive.on("data", (c: Buffer) => chunks.push(c))
    archive.on("warning", (e) => {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") console.warn(e)
      else reject(e)
    })
    archive.on("error", reject)
    archive.on("end", () => resolve(Buffer.concat(chunks)))
    for (const e of entries) {
      archive.file(e.absPath, { name: e.zipPath })
    }
    archive.finalize().catch(reject)
  })
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI 없음")
    process.exit(1)
  }

  const entries = buildEntries()
  const zipEntries = collectZipEntries()

  console.log(`\n=== 26년 3월 고2 조건영작배열 업로드 ${APPLY ? "[APPLY]" : "[DRY-RUN]"} ===\n`)
  console.log(`상품 ${entries.length}건 + 풀세트 ZIP 1건\n`)

  let missing = 0
  for (const e of entries) {
    const ok = fs.existsSync(e.absPath)
    if (!ok) missing++
    console.log(
      `  ${ok ? "OK " : "X  "} ${e.title} | ${e.price}원 | tags=[${e.tags.join(", ")}]`
    )
    if (!ok) console.log(`       → 누락: ${e.absPath}`)
  }

  for (const e of zipEntries) {
    const ok = fs.existsSync(e.absPath)
    if (!ok) missing++
    if (!ok) console.log(`  X  ZIP 소스 누락: ${e.absPath}`)
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
  let skipped = 0
  let failed = 0

  for (const e of entries) {
    try {
      const dup = await Product.findOne({ title: e.title })
      if (dup) {
        console.log(`SKIP ${e.title} (이미 존재)`)
        skipped++
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
        category: "grade2-material",
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

  try {
    const dup = await Product.findOne({ title: FULLSET.title })
    if (dup) {
      console.log(`SKIP ${FULLSET.title} (이미 존재)`)
      skipped++
    } else {
      console.log("ZIP 빌드 중…")
      const zipBuffer = await buildZipBuffer(zipEntries)
      const s3Key = await uploadToS3(zipBuffer, FULLSET.zipName)
      await Product.create({
        title: FULLSET.title,
        description: `${PREFIX} 조건영작배열 전 문항 (18~45번) × 전 난이도 (기본·중·고·최고) 풀세트. 25문항 × 4난이도.`,
        price: FULLSET.price,
        originalPrice: FULLSET.originalPrice,
        category: "grade2-material",
        tags: [...BASE_TAGS, "전체"],
        author: "PAYPERIC",
        authorId: "admin",
        fileName: path.basename(s3Key),
        originalFileName: FULLSET.zipName,
        fileSize: zipBuffer.length,
        filePath: s3Key,
        isFree: false,
      })
      created++
      console.log(
        `OK  ${FULLSET.title} (ZIP ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB)`
      )
    }
  } catch (err) {
    failed++
    console.error(`FAIL ${FULLSET.title}:`, (err as Error).message)
  }

  console.log(`\n생성: ${created} / 건너뜀: ${skipped} / 실패: ${failed}`)
  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error("오류:", err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
