import connectDB from '@/lib/db';
import User from '@/models/User';
import PricLedger, { type PricKind } from '@/models/PricLedger';

/**
 * 프릭(pric) 잔액 조작 — 1프릭 = 1원.
 *
 * 핵심: 사용(spend)·회수(recall)는 잔액 음수 방지를 위해 `{ pric: { $gte } }` 가드로
 * 원자적 차감한다(동시요청 이중차감 방지). 모든 변동은 PricLedger 에 기록.
 */

interface LedgerMeta {
  userEmail?: string;
  note?: string;
  orderId?: string;
  productId?: string;
  adminEmail?: string;
  [k: string]: unknown;
}

async function recordLedger(
  userId: string,
  delta: number,
  balanceAfter: number,
  kind: PricKind,
  meta?: LedgerMeta,
): Promise<void> {
  const { userEmail, ...rest } = meta ?? {};
  try {
    await PricLedger.create({ userId, userEmail, delta, balanceAfter, kind, meta: rest });
  } catch (e) {
    // 원장 기록 실패가 잔액 변경을 되돌리진 않음 — 로그만.
    console.error('PricLedger 기록 실패:', e);
  }
}

/** 신규가입 보너스 / 출석 보상 범위. */
export const SIGNUP_BONUS = 50000;
export const ATTENDANCE_MIN = 1000;
export const ATTENDANCE_MAX = 5000;

export async function getUserPric(userId: string): Promise<number> {
  await connectDB();
  const u = await User.findById(userId).select('pric').lean<{ pric?: number }>();
  return typeof u?.pric === 'number' && u.pric >= 0 ? u.pric : 0;
}

/** KST(UTC+9) 기준 오늘 0시. 출석 1일 1회 판정용. */
export function attendanceDayStart(now: Date = new Date()): Date {
  const KST = 9 * 60 * 60 * 1000;
  const DAY = 24 * 60 * 60 * 1000;
  return new Date(Math.floor((now.getTime() + KST) / DAY) * DAY - KST);
}

/** 잔액 + 오늘 출석 여부. */
export async function getPricStatus(userId: string): Promise<{ pric: number; attendanceToday: boolean }> {
  await connectDB();
  const u = await User.findById(userId).select('pric lastAttendanceDate').lean<{ pric?: number; lastAttendanceDate?: Date }>();
  const pric = typeof u?.pric === 'number' && u.pric >= 0 ? u.pric : 0;
  const last = u?.lastAttendanceDate ? new Date(u.lastAttendanceDate) : null;
  const attendanceToday = !!last && last.getTime() >= attendanceDayStart().getTime();
  return { pric, attendanceToday };
}

/** 임의 kind 로 가산 + 원장 기록 (내부 공용). */
async function addPric(
  userId: string,
  amount: number,
  kind: PricKind,
  meta?: LedgerMeta,
): Promise<{ balanceAfter: number; delta: number } | null> {
  await connectDB();
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const updated = await User.findByIdAndUpdate(userId, { $inc: { pric: amount } }, { new: true }).select('pric email');
  if (!updated) return null;
  const balanceAfter = updated.pric ?? amount;
  await recordLedger(userId, amount, balanceAfter, kind, { userEmail: updated.email, ...meta });
  return { balanceAfter, delta: amount };
}

/** 신규가입 보너스 50,000 프릭 (멱등 — 이미 받았으면 skip). */
export async function grantSignupBonus(userId: string, meta?: LedgerMeta): Promise<{ balanceAfter: number } | null> {
  await connectDB();
  const already = await PricLedger.findOne({ userId, kind: 'signup_bonus' }).lean();
  if (already) return null;
  const res = await addPric(userId, SIGNUP_BONUS, 'signup_bonus', { note: '신규가입 보너스', ...meta });
  return res ? { balanceAfter: res.balanceAfter } : null;
}

/** 기존회원 일괄지급 (멱등 — 가입보너스/백필 이력 있으면 skip). 스크립트에서 사용. */
export async function grantBackfillPric(userId: string, amount: number, meta?: LedgerMeta): Promise<{ balanceAfter: number } | null> {
  await connectDB();
  const already = await PricLedger.findOne({ userId, kind: { $in: ['backfill', 'signup_bonus'] } }).lean();
  if (already) return null;
  const res = await addPric(userId, amount, 'backfill', { note: '기존회원 일괄지급', ...meta });
  return res ? { balanceAfter: res.balanceAfter } : null;
}

/** 출석 보상 — 1일 1회, 1000~5000(100 단위) 랜덤. 원자적 일일 점유. */
export async function claimAttendance(
  userId: string,
): Promise<{ ok: boolean; alreadyChecked: boolean; reward: number; balanceAfter: number }> {
  await connectDB();
  const dayStart = attendanceDayStart();
  const claimed = await User.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { lastAttendanceDate: { $exists: false } },
        { lastAttendanceDate: null },
        { lastAttendanceDate: { $lt: dayStart } },
      ],
    },
    { $set: { lastAttendanceDate: new Date() } },
    { new: false },
  ).select('_id');

  if (!claimed) {
    const exists = await User.exists({ _id: userId });
    return { ok: false, alreadyChecked: !!exists, reward: 0, balanceAfter: await getUserPric(userId) };
  }

  const steps = (ATTENDANCE_MAX - ATTENDANCE_MIN) / 100; // 40
  const reward = ATTENDANCE_MIN + Math.floor(Math.random() * (steps + 1)) * 100; // 1000~5000
  const res = await addPric(userId, reward, 'attendance', { note: '출석 보상' });
  return { ok: true, alreadyChecked: false, reward, balanceAfter: res?.balanceAfter ?? (await getUserPric(userId)) };
}

/** 관리자 지급 (amount>0). */
export async function grantPric(
  userId: string,
  amount: number,
  meta?: LedgerMeta,
): Promise<{ balanceAfter: number; delta: number } | null> {
  await connectDB();
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const updated = await User.findByIdAndUpdate(userId, { $inc: { pric: amount } }, { new: true }).select('pric email');
  if (!updated) return null;
  const balanceAfter = updated.pric ?? amount;
  await recordLedger(userId, amount, balanceAfter, 'admin_grant', { userEmail: updated.email, ...meta });
  return { balanceAfter, delta: amount };
}

/** 관리자 회수 (amount>0, 잔액 미만이면 0까지만 회수). */
export async function recallPric(
  userId: string,
  amount: number,
  meta?: LedgerMeta,
): Promise<{ balanceAfter: number; delta: number } | null> {
  await connectDB();
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const user = await User.findById(userId).select('pric email');
  if (!user) return null;
  const cur = typeof user.pric === 'number' && user.pric >= 0 ? user.pric : 0;
  const take = Math.min(amount, cur);
  if (take <= 0) return { balanceAfter: cur, delta: 0 };
  const updated = await User.findOneAndUpdate(
    { _id: userId, pric: { $gte: take } },
    { $inc: { pric: -take } },
    { new: true },
  ).select('pric email');
  if (!updated) {
    // 경합으로 잔액이 바뀜 — 현재 잔액 기준 재계산 없이 실패 처리(상위에서 재시도).
    return { balanceAfter: cur, delta: 0 };
  }
  const balanceAfter = updated.pric ?? 0;
  await recordLedger(userId, -take, balanceAfter, 'admin_recall', { userEmail: updated.email, ...meta });
  return { balanceAfter, delta: -take };
}

/** 지급/회수 통합 (delta>0 지급, delta<0 회수). */
export async function adminAdjustPric(
  userId: string,
  delta: number,
  meta?: LedgerMeta,
): Promise<{ balanceAfter: number; delta: number } | null> {
  if (delta > 0) return grantPric(userId, delta, meta);
  if (delta < 0) return recallPric(userId, -delta, meta);
  return null;
}

/**
 * 결제용 차감 — 원자적 가드. 잔액 부족이면 ok:false (차감 안 함).
 * amount===0 이면 변동 없이 성공.
 */
export async function spendPric(
  userId: string,
  amount: number,
  meta?: LedgerMeta,
): Promise<{ ok: boolean; balanceAfter: number }> {
  await connectDB();
  if (!Number.isFinite(amount) || amount < 0) return { ok: false, balanceAfter: await getUserPric(userId) };
  if (amount === 0) return { ok: true, balanceAfter: await getUserPric(userId) };
  const updated = await User.findOneAndUpdate(
    { _id: userId, pric: { $gte: amount } },
    { $inc: { pric: -amount } },
    { new: true },
  ).select('pric email');
  if (!updated) return { ok: false, balanceAfter: await getUserPric(userId) };
  const balanceAfter = updated.pric ?? 0;
  await recordLedger(userId, -amount, balanceAfter, 'spend', { userEmail: updated.email, ...meta });
  return { ok: true, balanceAfter };
}

/** 차감했던 프릭 되돌리기 (결제 실패 등). */
export async function refundPric(
  userId: string,
  amount: number,
  meta?: LedgerMeta,
): Promise<{ balanceAfter: number }> {
  await connectDB();
  if (!Number.isFinite(amount) || amount <= 0) return { balanceAfter: await getUserPric(userId) };
  const updated = await User.findByIdAndUpdate(userId, { $inc: { pric: amount } }, { new: true }).select('pric email');
  const balanceAfter = updated?.pric ?? (await getUserPric(userId));
  await recordLedger(userId, amount, balanceAfter, 'refund', { userEmail: updated?.email, ...meta });
  return { balanceAfter };
}
