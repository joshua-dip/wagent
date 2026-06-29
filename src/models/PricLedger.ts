import mongoose, { Schema, Document } from 'mongoose';

/** 프릭(pric) 거래 원장 — 1프릭 = 1원. */
export type PricKind =
  | 'admin_grant'
  | 'admin_recall'
  | 'spend'
  | 'refund'
  | 'signup_bonus'   // 신규가입 보너스
  | 'attendance'     // 매일 출석 보상
  | 'backfill';      // 기존회원 일괄지급

export interface IPricLedger extends Document {
  userId: string;
  userEmail?: string;
  /** 양수: 지급/환불, 음수: 사용/회수 */
  delta: number;
  /** 거래 직후 잔액 */
  balanceAfter: number;
  kind: PricKind;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const PricLedgerSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String },
  delta: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  kind: {
    type: String,
    enum: ['admin_grant', 'admin_recall', 'spend', 'refund', 'signup_bonus', 'attendance', 'backfill'],
    required: true,
  },
  meta: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });

PricLedgerSchema.index({ userId: 1, createdAt: -1 });

const PricLedger = mongoose.models.PricLedger || mongoose.model<IPricLedger>('PricLedger', PricLedgerSchema);
export default PricLedger;
