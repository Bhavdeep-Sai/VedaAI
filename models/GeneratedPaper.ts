import 'server-only';
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPaperQuestion {
  number: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  answer: string;
  subParts: string[];
}

export interface IPaperSection {
  title: string;
  type: string;
  instructions: string;
  questions: IPaperQuestion[];
  totalMarks: number;
}

export interface IPaperMetadata {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
}

export interface IGeneratedPaper extends Document {
  _id: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  metadata: IPaperMetadata;
  sections: IPaperSection[];
  totalQuestions: number;
  totalMarks: number;
  generatedAt: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGeneratedPaperDTO {
  assignmentId: mongoose.Types.ObjectId;
  metadata: IPaperMetadata;
  sections: IPaperSection[];
  totalQuestions: number;
  totalMarks: number;
  version: number;
}

const PaperQuestionSchema = new Schema<IPaperQuestion>(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Moderate', 'Challenging'],
    },
    marks: { type: Number, required: true, min: 1 },
    answer: { type: String, required: true },
    subParts: { type: [String], default: [] },
  },
  { _id: false },
);

const PaperSectionSchema = new Schema<IPaperSection>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    instructions: { type: String, required: true },
    questions: { type: [PaperQuestionSchema], required: true },
    totalMarks: { type: Number, required: true },
  },
  { _id: false },
);

const PaperMetadataSchema = new Schema<IPaperMetadata>(
  {
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maxMarks: { type: Number, required: true },
  },
  { _id: false },
);

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    metadata: { type: PaperMetadataSchema, required: true },
    sections: { type: [PaperSectionSchema], required: true },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

GeneratedPaperSchema.index({ assignmentId: 1, version: -1 });
GeneratedPaperSchema.index({ generatedAt: -1 });

const GeneratedPaper: Model<IGeneratedPaper> =
  mongoose.models.GeneratedPaper ??
  mongoose.model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);

export default GeneratedPaper;
