'use client';

import { X, Minus, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { QuestionTypeConfig } from '@/types/assignment.types';

const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Answer Questions',
  'Long Answer Questions',
  'True or False',
  'Fill in the Blanks',
  'Match the Following',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Essay Questions',
  'Case Study Questions',
];

interface QuestionTypeRowProps {
  value: QuestionTypeConfig;
  onChange: (updated: QuestionTypeConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
}

export function QuestionTypeRow({
  value,
  onChange,
  onRemove,
  canRemove,
  index,
}: QuestionTypeRowProps) {
  const handleTypeChange = (type: string) => {
    onChange({ ...value, type });
  };

  const handleCountChange = (delta: number) => {
    const next = Math.max(1, Math.min(100, value.count + delta));
    onChange({ ...value, count: next });
  };

  const handleMarksChange = (delta: number) => {
    const next = Math.max(1, Math.min(100, value.marksPerQuestion + delta));
    onChange({ ...value, marksPerQuestion: next });
  };

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center py-2">
      {/* Question Type Selector */}
      <Select value={value.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="h-9 text-sm" aria-label={`Question type ${index + 1}`}>
          <SelectValue placeholder="Select question type" />
        </SelectTrigger>
        <SelectContent>
          {QUESTION_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Remove Button */}
      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors flex-shrink-0"
          aria-label={`Remove question type ${index + 1}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="w-7" />
      )}

      {/* Count Counter */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => handleCountChange(-1)}
          className="counter-btn"
          aria-label="Decrease count"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center text-sm font-medium tabular-nums">
          {value.count}
        </span>
        <button
          type="button"
          onClick={() => handleCountChange(1)}
          className="counter-btn"
          aria-label="Increase count"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Marks Counter */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => handleMarksChange(-1)}
          className="counter-btn"
          aria-label="Decrease marks"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center text-sm font-medium tabular-nums">
          {value.marksPerQuestion}
        </span>
        <button
          type="button"
          onClick={() => handleMarksChange(1)}
          className="counter-btn"
          aria-label="Increase marks"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
