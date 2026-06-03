import 'server-only';
import type { IAssignment } from '@/models/Assignment';

const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Builds a comprehensive, structured prompt for Gemini to generate a question paper.
 * The prompt instructs the AI to respond with strict JSON conforming to our schema.
 */
export function buildQuestionPaperPrompt(
  assignment: IAssignment,
  fileContent: string,
): string {
  const questionTypeSections = assignment.questionTypes
    .map(
      (qt, idx) =>
        `Section ${SECTION_LETTERS[idx]} — ${qt.type}: ${qt.count} questions × ${qt.marksPerQuestion} marks each`,
    )
    .join('\n');

  const totalQuestions = assignment.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = assignment.questionTypes.reduce(
    (sum, qt) => sum + qt.count * qt.marksPerQuestion,
    0,
  );

  const dueDateStr = new Date(assignment.dueDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Estimate tokens (roughly 4 chars per token)
  const maxTokens = 6000;
  const maxChars = maxTokens * 4;
  
  const truncatedContent =
    fileContent.length > maxChars 
      ? fileContent.substring(0, maxChars) + '\n...[content truncated to fit token limits]' 
      : fileContent;

  const additionalContext = assignment.additionalInstructions
    ? `\n\nAdditional Instructions from Teacher:\n${assignment.additionalInstructions}`
    : '';

  return `You are an expert educational assessment designer creating a professional question paper for Indian schools.

## Assignment Context
- **Title**: ${assignment.title}
- **Due Date**: ${dueDateStr}
- **Total Questions**: ${totalQuestions}
- **Total Marks**: ${totalMarks}

## Required Question Sections
${questionTypeSections}
${additionalContext}

## Source Document (Study Material)
The following is the content from the uploaded study material. Generate questions ONLY based on this content:

---
${truncatedContent}
---

## Question Difficulty Distribution
For each section, distribute difficulty as follows:
- Easy: ~30% of questions (basic recall, definitions)
- Moderate: ~50% of questions (application, understanding)
- Challenging: ~20% of questions (analysis, synthesis, evaluation)

## Instructions
1. Generate exactly the specified number of questions per section type
2. Each question must be directly based on the source document
3. Questions must be age-appropriate and pedagogically sound
4. Provide a complete, accurate answer for each question
5. For Multiple Choice Questions, include 4 options (A, B, C, D) in the question text
6. For diagram/graph questions, describe the diagram conceptually
7. Include the provided school name, class, subject, and time allowance in the header metadata exactly as provided.

## Response Format
Respond ONLY with a valid JSON object matching this exact schema (no markdown, no explanation):

{
  "metadata": {
    "schoolName": "${assignment.schoolName || 'Delhi Public School'}",
    "subject": "${assignment.subject || '<inferred subject name>'}",
    "className": "${assignment.className || '<inferred class>'}",
    "timeAllowed": "${assignment.timeAllowed || '2 hours'}",
    "maxMarks": ${totalMarks}
  },
  "sections": [
    {
      "title": "Section A",
      "type": "${assignment.questionTypes[0]?.type ?? 'Short Answer Questions'}",
      "instructions": "Attempt all questions. Each question carries ${assignment.questionTypes[0]?.marksPerQuestion ?? 1} mark(s).",
      "questions": [
        {
          "number": 1,
          "text": "<complete question text>",
          "difficulty": "Easy",
          "marks": ${assignment.questionTypes[0]?.marksPerQuestion ?? 1},
          "answer": "<complete model answer>",
          "subParts": []
        }
      ],
      "totalMarks": ${(assignment.questionTypes[0]?.count ?? 0) * (assignment.questionTypes[0]?.marksPerQuestion ?? 1)}
    }
  ],
  "totalQuestions": ${totalQuestions},
  "totalMarks": ${totalMarks}
}

Generate all ${totalQuestions} questions across ${assignment.questionTypes.length} section(s). Ensure the JSON is complete and valid.`;
}
