/**
 * assets/products/ 폴더의 PDF와 assets/products.json 메타데이터를 읽어
 * S3에 업로드하고 MongoDB에 상품을 등록하는 스크립트.
 *
 * 사용법:
 *   npm run seed-products
 *
 * products.json 형식:
 *   [{ file, title, description, price, tags, ?originalPrice, ?category, ?isFree }]
 *
 * tags에 "고1"/"고2"/"고3"이 포함되면 category를 자동 추론합니다.
 * 이미 같은 title로 등록된 상품은 건너뜁니다.
 */

import { config } from "dotenv"
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

config({ path: path.resolve(process.cwd(), ".env.local") })

// ── S3 ────────────────────────────────────────────────

const s3 = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: (process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
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

// ── Product model (인라인 — path alias 없이 독립 실행) ──

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    category: {
      type: String,
      required: true,
      enum: [
        "shared-materials", "original-translation", "lecture-material",
        "class-material", "line-translation", "english-writing",
        "translation-writing", "workbook-blanks", "order-questions",
        "insertion-questions", "ebs-lecture", "ebs-workbook", "ebs-test",
        "reading-comprehension", "reading-strategy", "reading-test",
        "grade1-material", "grade2-material", "grade3-material",
      ],
    },
    tags: [{ type: String, trim: true }],
    author: { type: String, required: true, trim: true },
    authorId: { type: String, required: true },
    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    filePath: { type: String, required: true },
    thumbnail: { type: String },
    downloadCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFree: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema)

// ── 카테고리 자동 추론 ────────────────────────────────

function inferCategory(tags: string[]): string {
  if (tags.includes("고1")) return "grade1-material"
  if (tags.includes("고2")) return "grade2-material"
  if (tags.includes("고3")) return "grade3-material"
  return "shared-materials"
}

// ── 메타데이터 타입 ───────────────────────────────────

interface ProductEntry {
  file: string
  title: string
  description: string
  price: number
  tags: string[]
  originalPrice?: number
  category?: string
  isFree?: boolean
}

// ── 메인 ──────────────────────────────────────────────

async function main() {
  const assetsDir = path.resolve(process.cwd(), "assets/products")
  const jsonPath = path.resolve(process.cwd(), "assets/products.json")

  if (!fs.existsSync(jsonPath)) {
    console.error("❌  assets/products.json 파일이 없습니다.")
    process.exit(1)
  }

  const entries: ProductEntry[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
  if (entries.length === 0) {
    console.log("ℹ️  등록할 상품이 없습니다.")
    process.exit(0)
  }

  // MongoDB 연결
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("❌  MONGODB_URI 환경 변수가 없습니다.")
    process.exit(1)
  }
  await mongoose.connect(uri)
  console.log("✅  MongoDB 연결 완료\n")

  let created = 0
  let skipped = 0
  let failed = 0

  for (const entry of entries) {
    const label = `[${entry.title}]`

    // 중복 체크
    const exists = await Product.findOne({ title: entry.title })
    if (exists) {
      console.log(`⏭️  ${label} 이미 존재 — 건너뜀`)
      skipped++
      continue
    }

    // PDF 파일 확인
    const pdfPath = path.join(assetsDir, entry.file)
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌  ${label} 파일 없음: ${entry.file}`)
      failed++
      continue
    }

    try {
      const buffer = fs.readFileSync(pdfPath)
      const fileSize = buffer.length

      // S3 업로드
      console.log(`📤  ${label} S3 업로드 중…`)
      const s3Key = await uploadToS3(buffer, entry.file)

      // DB 저장
      await Product.create({
        title: entry.title,
        description: entry.description,
        price: entry.tags?.includes('빈칸재배열형') ? 0 : entry.price,
        originalPrice: entry.originalPrice,
        category: entry.category || inferCategory(entry.tags),
        tags: entry.tags,
        author: "PAYPERIC",
        authorId: "admin",
        fileName: path.basename(s3Key),
        originalFileName: entry.file,
        fileSize,
        filePath: s3Key,
        isFree: entry.isFree ?? entry.tags?.includes('빈칸재배열형') ?? entry.price === 0,
      })

      console.log(`✅  ${label} 등록 완료 (${(fileSize / 1024).toFixed(0)} KB)`)
      created++
    } catch (err) {
      console.error(`❌  ${label} 실패:`, err instanceof Error ? err.message : err)
      failed++
    }
  }

  console.log(`\n── 결과 ──────────────────`)
  console.log(`   생성: ${created}`)
  console.log(`   건너뜀: ${skipped}`)
  console.log(`   실패: ${failed}`)
  console.log(`──────────────────────────\n`)

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error("치명적 오류:", err)
  process.exit(1)
})
