import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  author: string;
  authorId: string; // 업로드한 사용자 ID
  fileName: string; // 실제 파일명
  originalFileName: string; // 원본 파일명
  fileSize: number; // 파일 크기 (bytes)
  filePath: string; // 서버 내 파일 경로
  thumbnail?: string; // 썸네일 이미지 경로
  downloadCount: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200 
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 2000 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  originalPrice: { 
    type: Number, 
    min: 0 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['development', 'design', 'business', 'education', 'ebook', 'template', 'other']
  },
  tags: [{ 
    type: String, 
    trim: true 
  }],
  author: { 
    type: String, 
    required: true,
    trim: true 
  },
  authorId: { 
    type: String, 
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  originalFileName: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  filePath: { 
    type: String, 
    required: true 
  },
  thumbnail: { 
    type: String 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5 
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// 인덱스 추가
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ authorId: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ createdAt: -1 });

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;