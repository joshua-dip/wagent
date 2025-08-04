import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  userId: string;
  userEmail: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  downloadCount: number;
  maxDownloads: number;
  purchaseDate: Date;
  lastDownloadDate?: Date;
  isActive: boolean;
  paymentMethod: 'card' | 'bank' | 'paypal' | 'test'; // 테스트용
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
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
  productPrice: { 
    type: Number, 
    required: true,
    min: 0 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  maxDownloads: { 
    type: Number, 
    default: 5 // 최대 5회 다운로드 허용
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
    enum: ['card', 'bank', 'paypal', 'test'],
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending' 
  },
  transactionId: { 
    type: String 
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