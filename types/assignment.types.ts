import { z } from 'zod';
import { CreateAssignmentSchema, QuestionTypeConfigSchema } from '@/schemas/assignment.schema';

export type QuestionDifficulty = 'Easy' | 'Moderate' | 'Challenging';

export type AssignmentStatus =
  | 'draft'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export type FileType = 'pdf' | 'txt' | '';

export type HeaderLayout = 'layout-1' | 'layout-2' | 'layout-3';

export type QuestionTypeConfig = z.infer<typeof QuestionTypeConfigSchema>;
export type CreateAssignmentPayload = z.infer<typeof CreateAssignmentSchema>;

export interface Assignment extends CreateAssignmentPayload {
  _id: string;
  status: AssignmentStatus;
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAssignmentStatusPayload {
  status: AssignmentStatus;
}

// Form-level DTOs
export interface AssignmentFormStep1 {
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
}

export interface AssignmentFormStep2 {
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
}

export interface AssignmentFormStep3 {
  schoolName: string;
  className: string;
  subject: string;
  timeAllowed: string;
  headerLayout: HeaderLayout;
}

export type AssignmentFormData = AssignmentFormStep1 & AssignmentFormStep2 & AssignmentFormStep3;
