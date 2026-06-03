import { z } from 'zod';

export const GenerateSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
});

export type GenerateInput = z.infer<typeof GenerateSchema>;
