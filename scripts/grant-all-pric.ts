/**
 * 기존 전 회원에게 프릭 일괄 지급 (기본 50,000).
 *
 *   npx tsx scripts/grant-all-pric.ts                 # dry-run (변경 없음)
 *   npx tsx scripts/grant-all-pric.ts --apply         # 실제 지급
 *   npx tsx scripts/grant-all-pric.ts --apply --amount 50000
 *
 * 멱등: 이미 가입보너스(signup_bonus) 또는 백필(backfill) 원장이 있는 회원은 건너뜀.
 * → 여러 번 실행해도 중복 지급되지 않음. 앞으로 신규가입자는 가입 시 자동 지급되므로 제외됨.
 */
import { config } from "dotenv"
import path from "path"
import mongoose from "mongoose"

config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")
const amountArgIdx = process.argv.indexOf("--amount")
const AMOUNT = amountArgIdx >= 0 ? parseInt(process.argv[amountArgIdx + 1], 10) : 50000

async function main() {
  if (!Number.isFinite(AMOUNT) || AMOUNT <= 0) {
    console.error("amount 가 올바르지 않습니다.")
    process.exit(1)
  }
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI 없음")
    process.exit(1)
  }

  await mongoose.connect(uri)
  const users = mongoose.connection.collection("users")
  const ledger = mongoose.connection.collection("pricledgers")

  const all = await users.find({}, { projection: { email: 1, pric: 1 } }).toArray()
  console.log(`\n=== 기존회원 프릭 일괄지급 ${APPLY ? "[APPLY]" : "[DRY-RUN]"} | 1인 ${AMOUNT.toLocaleString()} 프릭 ===`)
  console.log(`전체 회원 ${all.length}명\n`)

  let granted = 0
  let skipped = 0
  const now = new Date()

  for (const u of all) {
    const userId = String(u._id)
    const dup = await ledger.findOne({ userId, kind: { $in: ["signup_bonus", "backfill"] } })
    if (dup) {
      skipped++
      continue
    }
    const before = typeof u.pric === "number" && u.pric >= 0 ? u.pric : 0
    const after = before + AMOUNT

    if (APPLY) {
      await users.updateOne({ _id: u._id }, { $inc: { pric: AMOUNT } })
      await ledger.insertOne({
        userId,
        userEmail: u.email,
        delta: AMOUNT,
        balanceAfter: after,
        kind: "backfill",
        meta: { note: "기존회원 일괄지급" },
        createdAt: now,
      })
    }
    granted++
    if (granted <= 20 || granted % 100 === 0) {
      console.log(`  ${APPLY ? "✓" : "·"} ${u.email ?? userId}: ${before.toLocaleString()} → ${after.toLocaleString()}`)
    }
  }

  console.log(`\n${APPLY ? "지급" : "지급 예정"}: ${granted}명 / 건너뜀(이미 받음): ${skipped}명`)
  if (!APPLY) console.log("실제 지급은 --apply 를 붙여 다시 실행하세요.")
  await mongoose.disconnect()
}

main().catch(async (e) => {
  console.error("오류:", e)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
