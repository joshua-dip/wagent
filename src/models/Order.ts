import mongoose, { Schema, Document } from 'mongoose';

// 임시 주문 정보 (결제 전)
export interface IOrder extends Document {
  orderId: string;
  userId: string;
  userEmail: string;
  cartItems: Array<{
    productId: string;
    title: string;
    price: number;
    category: string;
  }>;
  totalAmount: number;
  /** 사용한 프릭 (1프릭=1원). 기본 0. */
  pricUsed: number;
  /** 카드로 실제 결제할 금액 = totalAmount - pricUsed. 미설정(구버전)이면 totalAmount 로 간주. */
  payableAmount?: number;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED';
  createdAt: Date;
  expiresAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderId: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  userId: { 
    type: String, 
    required: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  cartItems: [{
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  pricUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  payableAmount: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'EXPIRED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    // 30분 후 만료
    default: () => new Date(Date.now() + 30 * 60 * 1000)
  }
}, { 
  timestamps: true 
});

// 인덱스
OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ expiresAt: 1 });

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;

