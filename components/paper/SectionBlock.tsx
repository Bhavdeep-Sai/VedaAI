'use client';

import { QuestionItem } from './QuestionItem';
import type { PaperSection } from '@/types/paper.types';

interface SectionBlockProps {
  section: PaperSection;
  showAnswers?: boolean;
}

export function SectionBlock({ section, showAnswers = false }: SectionBlockProps) {
  return (
    <div className="mb-8">
      {/* Section Title */}
      <h2 className="paper-section-title text-center">{section.title}</h2>

      {/* Section Type & Instructions */}
      <div className="text-center mb-4">
        <p className="font-semibold text-sm">{section.type}</p>
        <p className="text-sm text-[var(--text-secondary)] italic">{section.instructions}</p>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {section.questions.map((question) => (
          <QuestionItem
            key={question.number}
            question={question}
            showAnswer={showAnswers}
          />
        ))}
      </div>
    </div>
  );
}
