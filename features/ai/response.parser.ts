import 'server-only';
import { z } from 'zod';
import type { GeneratedPaper } from '@/types/paper.types';

// ─── Zod Schema for AI Response ──────────────────────────────────────────────

import { AIResponseSchema } from '@/schemas/paper.schema';

type AIResponseType = z.infer<typeof AIResponseSchema>;

// ─── Parser ──────────────────────────────────────────────────────────────────

export class ResponseParseError extends Error {
  constructor(
    message: string,
    public readonly raw: string,
    public readonly zodError?: z.ZodError,
  ) {
    super(message);
    this.name = 'ResponseParseError';
  }
}

/**
 * Extract JSON from response (handles markdown code blocks)
 */
function extractJSON(rawText: string): string {
  // Remove markdown code block wrappers if present
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Try to find raw JSON object/array
  const jsonStart = rawText.indexOf('{');
  const jsonEnd = rawText.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    return rawText.substring(jsonStart, jsonEnd + 1);
  }

  return rawText.trim();
}

/**
 * Parse and validate the raw AI response text into a structured GeneratedPaper.
 */
export function parseAIResponse(
  rawText: string,
  assignmentId: string,
): GeneratedPaper {
  // 1. Extract JSON from response
  let jsonString: string;
  try {
    jsonString = extractJSON(rawText);
  } catch {
    throw new ResponseParseError('Failed to extract JSON from AI response', rawText);
  }

  // 2. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new ResponseParseError(
      `Invalid JSON in AI response: ${e instanceof Error ? e.message : 'parse error'}`,
      jsonString,
    );
  }

  // 3. Validate with Zod schema
  const result = AIResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new ResponseParseError(
      `AI response failed schema validation: ${result.error.message}`,
      jsonString,
      result.error,
    );
  }

  const validated: AIResponseType = result.data;

  // 4. Recalculate totals to prevent AI hallucinations
  let recalculatedTotal = 0;
  let recalculatedQuestions = 0;

  const sections = validated.sections.map((section) => {
    const sectionMarks = section.questions.reduce((sum, q) => sum + q.marks, 0);
    recalculatedTotal += sectionMarks;
    recalculatedQuestions += section.questions.length;

    return {
      ...section,
      totalMarks: sectionMarks, // Trust recalculated value
      questions: section.questions.map((q) => ({
        ...q,
        subParts: q.subParts ?? [],
      })),
    };
  });

  // 5. Build the GeneratedPaper object
  return {
    _id: '', // Will be set by DB
    assignmentId,
    metadata: {
      ...validated.metadata,
      maxMarks: recalculatedTotal,
    },
    sections,
    totalQuestions: recalculatedQuestions,
    totalMarks: recalculatedTotal,
    generatedAt: new Date().toISOString(),
    version: 1,
  };
}
