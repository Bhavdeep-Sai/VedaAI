import 'server-only';
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IGenerationStatus extends Document {
  _id: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  error: string | null;
  paperId: mongoose.Types.ObjectId | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const GenerationStatusSchema = new Schema<IGenerationStatus>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    message: {
      type: String,
      default: 'Queued for processing...',
    },
    error: {
      type: String,
      default: null,
    },
    paperId: {
      type: Schema.Types.ObjectId,
      ref: 'GeneratedPaper',
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const GenerationStatus: Model<IGenerationStatus> =
  mongoose.models.GenerationStatus ??
  mongoose.model<IGenerationStatus>('GenerationStatus', GenerationStatusSchema);

export default GenerationStatus;
