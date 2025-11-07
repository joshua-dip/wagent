import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  userId: string;
  userEmail: string;
  productId: string;
  productTitle: string;
  amount: number; // 실제 결제 금액
  productPrice?: number; // 상품 원가
  downloadCount: number;
  maxDownloads: number;
  purchaseDate: Date;
  lastDownloadDate?: Date;
  isActive: boolean;
  paymentMethod: string; // 'CARD', 'VIRTUAL_ACCOUNT', etc
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  // 토스페이먼츠 관련
  paymentKey?: string;
  orderId?: string;
  tossPaymentData?: any;
}

const PurchaseSchema: Schema = new Schema({
  userId: { 
    type: String, 
    required: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  productTitle: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  productPrice: { 
    type: Number,
    min: 0 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  maxDownloads: { 
    type: Number, 
    default: 10 // 최대 10회 다운로드 허용
  },
  purchaseDate: { 
    type: Date, 
    default: Date.now 
  },
  lastDownloadDate: { 
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING' 
  },
  transactionId: { 
    type: String 
  },
  paymentKey: {
    type: String
  },
  orderId: {
    type: String
  },
  tossPaymentData: {
    type: Schema.Types.Mixed
  }
}, { 
  timestamps: true 
});

// 인덱스 추가
PurchaseSchema.index({ userId: 1 });
PurchaseSchema.index({ productId: 1 });
PurchaseSchema.index({ userEmail: 1 });
PurchaseSchema.index({ paymentStatus: 1 });
PurchaseSchema.index({ purchaseDate: -1 });

// 복합 인덱스: 사용자별 상품 구매 확인용
PurchaseSchema.index({ userId: 1, productId: 1 });

const Purchase = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);
export default Purchase;