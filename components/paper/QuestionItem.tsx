'use client';

import { Badge } from '@/components/ui/badge';
import type { PaperQuestion } from '@/types/paper.types';

interface QuestionItemProps {
  question: PaperQuestion;
  showAnswer?: boolean;
}

const DIFFICULTY_BADGE_MAP: Record<string, 'easy' | 'moderate' | 'challenging'> = {
  Easy: 'easy',
  Moderate: 'moderate',
  Challenging: 'challenging',
};

export function QuestionItem({ question, showAnswer = false }: QuestionItemProps) {
  let mainText = question.text;
  let inlineOptions: string[] = [];

  // Parse inline MCQ options (e.g., A) ..., B) ..., C) ...)
  const parts = question.text.split(/(?=\s+(?:[A-Ea-e]\)|\([A-Ea-e]\)|[A-Ea-e]\.)\s+)/);
  if (parts.length >= 3) {
    const isValidSequence = parts.slice(1).every((part, i) => {
      const match = part.trim().match(/^(?:([A-Ea-e])\)|\(([A-Ea-e])\)|([A-Ea-e])\.)\s+/);
      if (!match) return false;
      const letter = (match[1] || match[2] || match[3]).toUpperCase();
      return letter.charCodeAt(0) === 65 + i; // Checks for A, B, C...
    });

    if (isValidSequence) {
      mainText = parts[0].trim();
      inlineOptions = parts.slice(1).map((opt) => opt.trim());
    }
  }

  return (
    <div className="paper-question">
      <div className="flex gap-2">
        <span className="font-medium text-[var(--text-primary)] flex-shrink-0">
          {question.number}.
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-[var(--text-muted)] text-xs mr-1.5">
            [{question.difficulty}]
          </span>
          <span className="text-[var(--text-primary)]">{mainText}</span>
          <span className="text-[var(--text-muted)] text-xs ml-2 whitespace-nowrap">
            [{question.marks} Mark{question.marks !== 1 ? 's' : ''}]
          </span>

          {inlineOptions.length > 0 && (
            <div className="mt-3 mb-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pl-1">
              {inlineOptions.map((opt, i) => (
                <div key={i} className="text-sm text-[var(--text-primary)]">
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sub-parts */}
      {question.subParts && question.subParts.length > 0 && (
        <div className="ml-6 mt-2 space-y-1">
          {question.subParts.map((part, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-[var(--text-muted)] flex-shrink-0">
                ({String.fromCharCode(97 + i)})
              </span>
              <span>{part}</span>
            </div>
          ))}
        </div>
      )}

      {/* Answer (for answer key section) */}
      {showAnswer && question.answer && (
        <div className="ml-6 mt-1.5 text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[var(--success-light)]">
          <span className="font-medium text-[var(--success)]">Ans: </span>
          {question.answer}
        </div>
      )}
    </div>
  );
}
