import mongoose, { Schema, Document } from 'mongoose';

/** 프릭 충전 주문 (카드 결제로 프릭 구매). 1프릭 = 1원. */
export interface IPricCharge extends Document {
  orderId: string;
  userId: string;
  userEmail?: string;
  amount: number; // 충전할 프릭 = 결제 원화
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED';
  paymentKey?: string;
  createdAt: Date;
  expiresAt: Date;
}

const PricChargeSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'EXPIRED'], default: 'PENDING' },
    paymentKey: { type: String },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 30 * 60 * 1000) },
  },
  { timestamps: true },
);

const PricCharge = mongoose.models.PricCharge || mongoose.model<IPricCharge>('PricCharge', PricChargeSchema);
export default PricCharge;
