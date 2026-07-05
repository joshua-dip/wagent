import mongoose, { Schema, Document } from 'mongoose';

/**
 * 그래머 큐레이터 — 문법 모듈(얇은 PDF 한 권). 청구기호(code) 로 카탈로그화.
 * 실제 PDF 전달은 pdfRef 로 연결된 기존 Product(S3) 를 그대로 재사용한다.
 */
export interface ICuratorModule extends Document {
  code: string;          // 청구기호 (예: "GC-101"). 백자리=대분류, 십·일자리=세부.
  category: string;      // 대분류 (문장구조 / 시제 / 준동사 / 관계사 / 접속사 …)
  title: string;         // 예: "문장의 5형식"
  description: string;   // 짧은 소개 (문학적 톤)
  pages: number;
  pdfRef?: mongoose.Types.ObjectId; // 연결된 PDF 상품(Product). 아직 없으면 비움.
  diagnosticTags: string[];         // 이 모듈이 커버하는 진단 태그 (추천 매핑 키)
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CuratorModuleSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, trim: true, index: true },
  category: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 1000 },
  pages: { type: Number, default: 0, min: 0 },
  pdfRef: { type: Schema.Types.ObjectId, ref: 'Product' },
  diagnosticTags: [{ type: String, trim: true }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

CuratorModuleSchema.index({ category: 1, order: 1 });
CuratorModuleSchema.index({ diagnosticTags: 1 });

const CuratorModule =
  mongoose.models.CuratorModule || mongoose.model<ICuratorModule>('CuratorModule', CuratorModuleSchema);
export default CuratorModule;
