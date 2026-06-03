export type QuestionDifficulty = 'Easy' | 'Moderate' | 'Challenging';

export type AssignmentStatus =
  | 'draft'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export type FileType = 'pdf' | 'txt' | '';

export type HeaderLayout = 'layout-1' | 'layout-2' | 'layout-3';

export interface QuestionTypeConfig {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface Assignment {
  _id: string;
  title: string;
  dueDate: string; // ISO string
  fileUrl: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  fileContent?: string; // extracted text, not always returned
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  schoolName: string;
  className: string;
  subject: string;
  timeAllowed: string;
  headerLayout: HeaderLayout;
  status: AssignmentStatus;
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentPayload {
  title: string;
  dueDate: string;
  fileUrl: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  schoolName: string;
  className: string;
  subject: string;
  timeAllowed: string;
  headerLayout: HeaderLayout;
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
