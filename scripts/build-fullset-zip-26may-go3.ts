/**
 * 26년 5월 고3 영어모의고사 조건영작배열 풀세트 ZIP 빌더.
 *
 * 기존 풀세트 상품(_id 유지)의 filePath만 ZIP S3 키로 교체한다.
 * ZIP 내부 구조:
 *   난이도별/기본난도.pdf
 *   난이도별/중난도.pdf
 *   난이도별/고난도.pdf
 *   난이도별/최고난도.pdf
 *   번호별/26년 5월 고3 영어모의고사 18번.pdf
 *   ...
 *   번호별/26년 5월 고3 영어모의고사 43~45번.pdf
 *
 * 사용법:
 *   npx tsx scripts/build-fullset-zip-26may-go3.ts            # dry-run
 *   npx tsx scripts/build-fullset-zip-26may-go3.ts --apply    # 실제 빌드 + 업로드 + DB 갱신
 */

import { config } from "dotenv"
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import type archiverType from "archiver"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// archiver는 CJS 모듈이라 default import가 tsx에서 깨짐 → require 사용
const archiver = require("archiver") as typeof archiverType

config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")

const SOURCE_DIR =
  "/Users/goshua/JCstars Dropbox/박준규/10모의고사/영어/03_고3/2026학년도 5월 고3 영어모의고사/조건영작배열"

const FULLSET_TITLE = "26년 5월 고3 영어모의고사 조건영작배열 전체 풀세트"
const ZIP_DISPLAY_NAME = "26년 5월 고3 영어모의고사_조건영작배열_풀세트.zip"

const DIFFICULTY_FILES = [
  "기본난도.pdf",
  "중난도.pdf",
  "고난도.pdf",
  "최고난도.pdf",
]

const NUMBER_FILES: string[] = [
  ...Array.from({ length: 23 }, (_, i) => `26년 5월 고3 영어모의고사 ${18 + i}번.pdf`),
  `26년 5월 고3 영어모의고사 41~42번.pdf`,
  `26년 5월 고3 영어모의고사 43~45번.pdf`,
]

interface ZipEntry {
  absPath: string
  zipPath: string
}

function collectEntries(): ZipEntry[] {
  const entries: ZipEntry[] = []
  for (const f of DIFFICULTY_FILES) {
    entries.push({
      absPath: path.join(SOURCE_DIR, "난이도별", f),
      zipPath: `난이도별/${f}`,
    })
  }
  for (const f of NUMBER_FILES) {
    entries.push({
      absPath: path.join(SOURCE_DIR, "번호별", f),
      zipPath: `번호별/${f}`,
    })
  }
  return entries
}

function buildZipBuffer(entries: ZipEntry[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // PDF는 이미 압축돼 있어 store(0) 모드가 빠르고 결과 크기도 거의 동일.
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

async function uploadZipToS3(buffer: Buffer, displayName: string): Promise<string> {
  const ts = Date.now()
  const safe = displayName.replace(/[^a-zA-Z0-9가-힣_.-]/g, "_")
  const key = `products/${ts}_${safe}`
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "application/zip",
      Metadata: {
        "original-name": Buffer.from(displayName, "utf8").toString("base64"),
        "uploaded-by": "PAYPERIC",
        "upload-date": new Date().toISOString(),
        "bundle-type": "fullset",
      },
    })
  )
  return key
}

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    fileName: String,
    originalFileName: String,
    fileSize: Number,
    filePath: String,
  },
  { timestamps: true, strict: false }
)
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema)

async function main() {
  const entries = collectEntries()

  console.log(`\n=== 26년 5월 고3 풀세트 ZIP 빌드 ${APPLY ? "[APPLY]" : "[DRY-RUN]"} ===\n`)
  console.log(`엔트리 ${entries.length}개:\n`)
  let missing = 0
  let totalBytes = 0
  for (const e of entries) {
    const ok = fs.existsSync(e.absPath)
    if (!ok) {
      missing++
      console.log(`  X  ${e.zipPath}  → 누락: ${e.absPath}`)
      continue
    }
    const size = fs.statSync(e.absPath).size
    totalBytes += size
    console.log(`  OK ${e.zipPath}  (${(size / 1024).toFixed(0)} KB)`)
  }
  if (missing > 0) {
    console.error(`\n${missing}개 누락. 중단.`)
    process.exit(1)
  }
  console.log(`\n원본 합계: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)

  if (!APPLY) {
    console.log("\ndry-run 종료. 실제 실행은 --apply.")
    return
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI 없음")
    process.exit(1)
  }

  console.log("\nZIP 생성 중…")
  const zipBuffer = await buildZipBuffer(entries)
  console.log(`ZIP 크기: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`)

  console.log("S3 업로드 중…")
  const s3Key = await uploadZipToS3(zipBuffer, ZIP_DISPLAY_NAME)
  console.log(`S3 키: ${s3Key}`)

  await mongoose.connect(uri)
  const existing = await Product.findOne({ title: FULLSET_TITLE })
  if (!existing) {
    console.error(`\n풀세트 상품을 찾을 수 없습니다: ${FULLSET_TITLE}`)
    await mongoose.disconnect()
    process.exit(1)
  }

  const prevPath = existing.filePath
  existing.filePath = s3Key
  existing.fileName = path.basename(s3Key)
  existing.originalFileName = ZIP_DISPLAY_NAME
  existing.fileSize = zipBuffer.length
  await existing.save()

  console.log(`\n상품 갱신 완료: ${existing._id}`)
  console.log(`  이전 filePath: ${prevPath}`)
  console.log(`  새 filePath:   ${s3Key}`)
  console.log(`  originalFileName: ${ZIP_DISPLAY_NAME}`)
  console.log(`  fileSize: ${zipBuffer.length}`)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error("오류:", err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
