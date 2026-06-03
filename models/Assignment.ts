import 'server-only';
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IQuestionTypeConfig {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  dueDate: Date;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'pdf' | 'txt' | '';
  fileSize?: number;
  fileContent: string; // extracted text from uploaded document
  questionTypes: IQuestionTypeConfig[];
  additionalInstructions: string;
  schoolName: string;
  className: string;
  subject: string;
  timeAllowed: string;
  headerLayout: 'layout-1' | 'layout-2' | 'layout-3';
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
  totalQuestions: number;
  totalMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeConfigSchema = new Schema<IQuestionTypeConfig>(
  {
    type: { type: String, required: true, trim: true },
    count: { type: Number, required: true, min: 1, max: 100 },
    marksPerQuestion: { type: Number, required: true, min: 1, max: 100 },
  },
  { _id: false },
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      trim: true,
      default: '',
    },
    fileType: {
      type: String,
      enum: ['pdf', 'txt', ''],
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileContent: {
      type: String,
      default: '',
    },
    questionTypes: {
      type: [QuestionTypeConfigSchema],
      required: true,
      validate: {
        validator: (v: IQuestionTypeConfig[]) => v.length > 0,
        message: 'At least one question type is required',
      },
    },
    additionalInstructions: {
      type: String,
      default: '',
      maxlength: [2000, 'Additional instructions cannot exceed 2000 characters'],
    },
    schoolName: {
      type: String,
      default: '',
      trim: true,
    },
    className: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    timeAllowed: {
      type: String,
      default: '',
      trim: true,
    },
    headerLayout: {
      type: String,
      enum: ['layout-1', 'layout-2', 'layout-3'],
      default: 'layout-1',
    },
    status: {
      type: String,
      enum: ['draft', 'queued', 'processing', 'completed', 'failed'],
      default: 'draft',
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes for performance
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ createdAt: -1 });
AssignmentSchema.index({ dueDate: 1 });

// Auto-calculate totals before save
AssignmentSchema.pre('save', async function (this: mongoose.Document & IAssignment) {
  if (this.questionTypes && this.questionTypes.length > 0) {
    this.totalQuestions = this.questionTypes.reduce((sum: number, qt: {count: number}) => sum + qt.count, 0);
    this.totalMarks = this.questionTypes.reduce(
      (sum: number, qt: {count: number, marksPerQuestion: number}) => sum + qt.count * qt.marksPerQuestion,
      0,
    );
  }
});

if (mongoose.models.Assignment) {
  delete mongoose.models.Assignment;
}
const Assignment: Model<IAssignment> = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
