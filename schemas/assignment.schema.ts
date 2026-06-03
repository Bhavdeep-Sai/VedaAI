import { z } from 'zod';

export const QuestionTypeConfigSchema = z.object({
  type: z.string().min(1),
  count: z.number().int().min(1).max(100),
  marksPerQuestion: z.number().int().min(1).max(100),
});

export const Step1Schema = z.object({
  title: z.string().min(1, 'Assignment title is required').max(200, 'Title too long'),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileType: z.union([z.enum(['pdf', 'txt']), z.literal('')]).optional(),
  fileSize: z.number().optional(),
  fileContent: z.string().optional(),
  wordCount: z.number().optional(),
});

export const Step2Schema = z.object({
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(date.getTime()) && date >= today;
    }, 'Due date must be today or in the future'),
  questionTypes: z
    .array(
      z.object({
        type: z.string().min(1, 'Select a question type'),
        count: z.number().int().min(1).max(100),
        marksPerQuestion: z.number().int().min(1).max(100),
      }),
    )
    .min(1, 'Add at least one question type'),
  additionalInstructions: z.string().max(2000).default(''),
});

export const Step3Schema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  className: z.string().min(1, 'Class is required'),
  subject: z.string().min(1, 'Subject is required'),
  timeAllowed: z.string().min(1, 'Time allowed is required (e.g. 2 hours)'),
  headerLayout: z.enum(['layout-1', 'layout-2', 'layout-3']).default('layout-1'),
});

export const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  dueDate: z.string().min(1, 'Due date is required'),
  fileUrl: z.string().default(''),
  fileName: z.string().default(''),
  fileType: z.union([z.enum(['pdf', 'txt']), z.literal('')]).default(''),
  fileSize: z.number().default(0),
  fileContent: z.string().default(''),
  questionTypes: z.array(QuestionTypeConfigSchema).min(1, 'At least one question type is required'),
  additionalInstructions: z.string().max(2000).default(''),
  schoolName: z.string().default(''),
  className: z.string().default(''),
  subject: z.string().default(''),
  timeAllowed: z.string().default(''),
  headerLayout: z.enum(['layout-1', 'layout-2', 'layout-3']).default('layout-1'),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
export type QuestionTypeConfigInput = z.infer<typeof QuestionTypeConfigSchema>;
