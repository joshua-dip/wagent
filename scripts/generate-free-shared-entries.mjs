/**
 * Scan assets/products/공유자료/26년 3월 고1 영어모의고사:
 * - PDF everywhere
 * - HWP only under 원문과해석 (한글 전용)
 * Append to assets/products.json (skip existing titles).
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "../assets/products")
const scanDir = path.join(root, "공유자료", "26년 3월 고1 영어모의고사")
const jsonPath = path.resolve(__dirname, "../assets/products.json")
const relPrefix = path.join("공유자료", "26년 3월 고1 영어모의고사")

const FOLDER_MAP = {
  영작하기: { category: "english-writing", label: "영작하기" },
  워크북_어법_양자택일: { category: "workbook-grammar-choice", label: "워크북 어법 양자택일" },
  한줄해석: { category: "line-translation", label: "한줄해석" },
  워크북_낱말배열: { category: "workbook-word-order", label: "워크북 낱말배열" },
  워크북_빈칸쓰기: { category: "workbook-blanks", label: "워크북 빈칸쓰기" },
  수업용자료: { category: "class-material", label: "수업용자료" },
  해석쓰기: { category: "translation-writing", label: "해석쓰기" },
  원문과해석: { category: "original-translation", label: "원문과 해석" },
  강의용자료: { category: "lecture-material", label: "강의용자료" },
}

/** macOS APFS often uses NFD; normalize for map lookup */
function nfc(s) {
  return s.normalize("NFC")
}

function* walkUploadable(dir, relFromScan = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    const rel = relFromScan ? `${relFromScan}/${e.name}` : e.name
    if (e.isDirectory()) {
      yield* walkUploadable(full, rel)
      continue
    }
    if (!e.isFile()) continue
    const low = e.name.toLowerCase()
    const top = nfc(rel.split("/")[0] || "")
    const underOriginal = top === "원문과해석"
    if (low.endsWith(".pdf")) {
      yield full
    } else if (underOriginal && low.endsWith(".hwp")) {
      yield full
    }
  }
}

function main() {
  const existing = JSON.parse(fs.readFileSync(jsonPath, "utf8"))
  const titles = new Set(existing.map((p) => p.title))

  const newEntries = []
  for (const abs of walkUploadable(scanDir)) {
    const relFromProducts = path.relative(root, abs)
    const parts = relFromProducts.split(path.sep)
    if (parts.length < 4) continue
    const rest = parts.slice(2, -1).map((p) => nfc(p))
    const ext = path.extname(abs).toLowerCase()
    const base = path.basename(abs, ext)
    let meta
    if (rest.length === 1) {
      meta = FOLDER_MAP[rest[0]]
    } else if (rest[0] === "워크북_빈칸쓰기" && rest.length >= 2) {
      meta = {
        category: "workbook-blanks",
        label: `워크북 빈칸쓰기 · ${rest.slice(1).join(" · ")}`,
      }
    } else {
      meta = FOLDER_MAP[rest.join("/")]
    }
    if (!meta) {
      console.warn("Skip (unknown folder):", relFromProducts)
      continue
    }
    const title = `26년 3월 고1 · ${meta.label} · ${nfc(base).replace(/_/g, " ")}`
    if (titles.has(title)) continue
    titles.add(title)
    const formatLabel = ext === ".hwp" ? "HWP" : "PDF"
    newEntries.push({
      file: relFromProducts.split(path.sep).join("/"),
      title,
      description:
        `26년 3월 고1 영어모의고사 무료 공유자료(${meta.label})입니다. (${formatLabel})`,
      price: 0,
      isFree: true,
      category: meta.category,
      tags: ["고1", "26년 3월", "무료공유", meta.label],
    })
  }

  existing.push(...newEntries)
  fs.writeFileSync(jsonPath, JSON.stringify(existing, null, 2) + "\n")
  console.log(`Appended ${newEntries.length} entries to products.json`)
}

main()
