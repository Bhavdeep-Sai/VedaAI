import type { QuestionDifficulty } from './assignment.types';

export interface PaperQuestion {
  number: number;
  text: string;
  difficulty: QuestionDifficulty;
  marks: number;
  answer: string;
  subParts: string[]; // always an array, empty by default
}

export interface PaperSection {
  title: string; // "Section A", "Section B", etc.
  type: string; // "Short Answer Questions", "Multiple Choice Questions", etc.
  instructions: string;
  questions: PaperQuestion[];
  totalMarks: number;
}

export interface PaperMetadata {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string; // "45 minutes", "3 hours"
  maxMarks: number;
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  metadata: PaperMetadata;
  sections: PaperSection[];
  totalQuestions: number;
  totalMarks: number;
  generatedAt: string;
  version: number;
}

export type GenerationStatusType =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export interface GenerationStatus {
  _id: string;
  assignmentId: string;
  jobId: string;
  status: GenerationStatusType;
  progress: number; // 0-100
  message: string;
  error: string | null;
  paperId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// SSE event shapes
export interface SSEEventBase {
  type: 'generation-started' | 'generation-progress' | 'generation-completed' | 'generation-failed';
  progress: number;
  message: string;
}

export interface SSECompletedEvent extends SSEEventBase {
  type: 'generation-completed';
  paperId: string;
}

export interface SSEFailedEvent extends SSEEventBase {
  type: 'generation-failed';
  error: string;
}

export type SSEEvent = SSEEventBase | SSECompletedEvent | SSEFailedEvent;
