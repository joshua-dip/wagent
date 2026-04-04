/**
 * products.json의 PDF 항목마다 같은 이름의 HWP가 있으면 S3 업로드 후
 * MongoDB Product에 hwpFilePath 등을 채웁니다 (이미 있으면 건너뜀).
 *
 *   npx tsx scripts/backfill-product-hwp.ts
 */
import { config } from "dotenv"
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

config({ path: path.resolve(process.cwd(), ".env.local") })

const s3 = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: (process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
  },
})
const BUCKET =
  process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || "wagent-products"

function contentTypeForFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  if (ext === ".hwp") return "application/x-hwp"
  return "application/pdf"
}

function siblingHwpRel(pdfRel: string): string {
  const d = path.posix.dirname(pdfRel)
  const b = path.posix.basename(pdfRel, path.posix.extname(pdfRel))
  return path.posix.join(d, b + ".hwp")
}

function absFromRel(assetsDir: string, relPosix: string): string {
  return path.join(assetsDir, ...relPosix.split("/"))
}

async function uploadHwp(buffer: Buffer, relForName: string): Promise<string> {
  const ts = Date.now()
  const safe = relForName.replace(/[^a-zA-Z0-9가-힣_.-]/g, "_")
  const key = `products/${ts}_${safe}`
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentTypeForFileName(relForName),
      Metadata: {
        "original-name": Buffer.from(relForName, "utf8").toString("base64"),
        "uploaded-by": "PAYPERIC",
        "upload-date": new Date().toISOString(),
      },
    })
  )
  return key
}

interface Entry {
  file: string
  title: string
}

async function main() {
  const assetsDir = path.resolve(process.cwd(), "assets/products")
  const jsonPath = path.resolve(process.cwd(), "assets/products.json")
  const entries: Entry[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI 없음")
    process.exit(1)
  }
  await mongoose.connect(uri)
  const col = mongoose.connection.db!.collection("products")

  let updated = 0
  let skipped = 0

  for (const entry of entries) {
    if (!entry.file?.toLowerCase().endsWith(".pdf")) continue
    const hwpRel = siblingHwpRel(entry.file)
    const hwpAbs = absFromRel(assetsDir, hwpRel)
    if (!fs.existsSync(hwpAbs)) {
      skipped++
      continue
    }

    const doc = await col.findOne({ title: entry.title })
    if (!doc) {
      skipped++
      continue
    }
    if (doc.hwpFilePath) {
      skipped++
      continue
    }

    const buf = fs.readFileSync(hwpAbs)
    const key = await uploadHwp(buf, hwpRel)
    await col.updateOne(
      { _id: doc._id },
      {
        $set: {
          hwpFilePath: key,
          hwpOriginalFileName: hwpRel,
          hwpFileSize: buf.length,
        },
      }
    )
    console.log("✅", entry.title)
    updated++
  }

  console.log(`\n업데이트: ${updated}, 건너뜀: ${skipped}`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
