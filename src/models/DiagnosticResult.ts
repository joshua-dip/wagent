import mongoose, { Schema, Document } from 'mongoose';

/** 진단 결과. 비로그인(sessionId) 허용, 로그인 시 userId 저장. */
export interface IDiagnosticAnswer {
  questionId: string;
  selected: number;   // 선택한 choice 인덱스
  correct: boolean;
}
export interface IDiagnosticResult extends Document {
  sessionId: string;          // 익명 세션 식별자
  userId?: string;            // 로그인 시
  userEmail?: string;
  setName: string;
  answers: IDiagnosticAnswer[];
  weakTags: string[];         // 오답에서 집계된 약점 태그
  recommendedModules: string[]; // 추천 Module.code 배열
  score: number;              // 맞은 개수
  total: number;
  createdAt: Date;
}

const DiagnosticResultSchema: Schema = new Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String },
  userEmail: { type: String },
  setName: { type: String, default: 'default' },
  answers: [{
    questionId: { type: String, required: true },
    selected: { type: Number, required: true },
    correct: { type: Boolean, default: false },
  }],
  weakTags: [{ type: String }],
  recommendedModules: [{ type: String }],
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } });

DiagnosticResultSchema.index({ userId: 1, createdAt: -1 });
DiagnosticResultSchema.index({ createdAt: -1 });

const DiagnosticResult =
  mongoose.models.DiagnosticResult || mongoose.model<IDiagnosticResult>('DiagnosticResult', DiagnosticResultSchema);
export default DiagnosticResult;
