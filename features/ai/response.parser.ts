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
 * Extract JSON from response (handles markdown code blocks, think blocks, etc.)
 */
function extractJSON(rawText: string): string {
  let text = rawText;

  // 0. Strip <think>...</think> reasoning blocks emitted by deepseek-r1 and similar models
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 1. Prefer an explicit ```json ... ``` wrapper
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // 2. Handle any generic ``` wrapper (e.g. the AI wrapped JSON in plain ``` blocks)
  const genericBlockMatch = text.match(/^```[^\n]*\n([\s\S]*?)```\s*$/);
  if (genericBlockMatch) {
    const inner = genericBlockMatch[1].trim();
    // Only return it if it looks like JSON, not a diagram
    if (inner.startsWith('{') || inner.startsWith('[')) {
      return inner;
    }
  }

  // 3. Find outermost { ... } using brace-depth counting.
  //    This correctly spans over embedded mermaid/code blocks inside JSON string values
  //    without being fooled by ``` markers that appear *inside* string values.
  const firstBrace = text.indexOf('{');
  if (firstBrace !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = firstBrace; i < text.length; i++) {
      const ch = text[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue; // skip everything inside string literals
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return text.substring(firstBrace, i + 1);
        }
      }
    }
  }

  return text.trim();
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
