import mongoose, { Schema, Document } from 'mongoose';

/** 그래머 큐레이터 진단 문항. tags 로 약점 영역(Module.diagnosticTags)과 매칭. */
export interface IDiagnosticChoice {
  text: string;
  isCorrect: boolean;
}
export interface IDiagnosticQuestion extends Document {
  prompt: string;
  choices: IDiagnosticChoice[];
  tags: string[];        // 이 문항이 측정하는 문법 영역
  difficulty: number;    // 선택 (1~5)
  setName: string;       // 진단셋 이름 (진단셋별 QR 발급용). 기본 'default'.
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiagnosticQuestionSchema: Schema = new Schema({
  prompt: { type: String, required: true, trim: true },
  choices: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  }],
  tags: [{ type: String, trim: true }],
  difficulty: { type: Number, default: 1, min: 1, max: 5 },
  setName: { type: String, default: 'default', trim: true, index: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

DiagnosticQuestionSchema.index({ setName: 1, order: 1 });

const DiagnosticQuestion =
  mongoose.models.DiagnosticQuestion || mongoose.model<IDiagnosticQuestion>('DiagnosticQuestion', DiagnosticQuestionSchema);
export default DiagnosticQuestion;
