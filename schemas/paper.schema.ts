import { z } from 'zod';

export const ChartDataSchema = z.object({
  type: z.enum(['bar', 'pie', 'line', 'histogram']),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const QuestionSchema = z.object({
  number: z.number().int().positive(),
  text: z.string().min(5, 'Question text too short'),
  difficulty: z.enum(['Easy', 'Moderate', 'Challenging']),
  marks: z.number().int().positive(),
  answer: z.string().min(1, 'Answer is required'),
  subParts: z.array(z.string()).optional().default([]),
  chartData: ChartDataSchema.optional(),
});

export const SectionSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  instructions: z.string().min(1),
  questions: z.array(QuestionSchema).min(1, 'Section must have at least one question'),
  totalMarks: z.number().positive().optional(),
});

export const MetadataSchema = z.object({
  schoolName: z.string().min(1),
  subject: z.string().min(1),
  className: z.string().min(1),
  timeAllowed: z.string().min(1),
  maxMarks: z.number().positive(),
});

export const AIResponseSchema = z.object({
  metadata: MetadataSchema,
  sections: z.array(SectionSchema).min(1, 'At least one section is required'),
  totalQuestions: z.number().int().positive().optional(),
  totalMarks: z.number().positive().optional(),
});

export type AIResponseInput = z.infer<typeof AIResponseSchema>;
