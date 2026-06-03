'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, FileText, BookOpen, Wand2 } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GenerationProgress } from '@/components/shared/GenerationProgress';
import { useGenerationStore } from '@/stores/generation.store';
import { toast } from 'sonner';
import type { Assignment } from '@/types/assignment.types';
import type { IGeneratedPaper } from '@/models/GeneratedPaper';

interface AssignmentDetailViewProps {
  assignment: Assignment;
  paper: IGeneratedPaper | null;
}

const STATUS_MAP: Record<
  Assignment['status'],
  { label: string; variant: 'default' | 'queued' | 'processing' | 'completed' | 'failed' }
> = {
  draft: { label: 'Draft', variant: 'default' },
  queued: { label: 'Queued', variant: 'queued' },
  processing: { label: 'Processing', variant: 'processing' },
  completed: { label: 'Completed', variant: 'completed' },
  failed: { label: 'Failed', variant: 'failed' },
};

export function AssignmentDetailView({ assignment, paper }: AssignmentDetailViewProps) {
  const router = useRouter();
  const { startGeneration, isGenerating } = useGenerationStore();
  const [showProgress, setShowProgress] = useState(
    ['queued', 'processing'].includes(assignment.status),
  );

  const handleGenerate = async () => {
    setShowProgress(true);
    try {
      await startGeneration(assignment._id);
    } catch (error) {
      setShowProgress(false);
      toast.error(error instanceof Error ? error.message : 'Generation failed');
    }
  };

  const handleViewPaper = () => {
    router.push(`/generated-paper/${assignment._id}`);
  };

  const status = STATUS_MAP[assignment.status];

  if (showProgress) {
    return (
      <div className="max-w-2xl mx-auto">
        <GenerationProgress
          assignmentId={assignment._id}
          onViewPaper={handleViewPaper}
          onRetry={() => startGeneration(assignment._id)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* ── Info Card ─────────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="font-semibold text-[var(--text-primary)] text-lg">
            {assignment.title}
          </h2>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                <span className="text-[var(--text-muted)]">Assigned: </span>
                {formatDate(assignment.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                <span className="text-[var(--text-muted)]">Due: </span>
                {formatDate(assignment.dueDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>
                <span className="text-[var(--text-muted)]">File: </span>
                {assignment.fileName} ({formatFileSize(assignment.fileSize)})
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span>
                <span className="text-[var(--text-muted)]">Questions: </span>
                {assignment.totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span>
                <span className="text-[var(--text-muted)]">Total Marks: </span>
                {assignment.totalMarks}
              </span>
            </div>
          </div>
        </div>

        {/* Question Types */}
        {assignment.questionTypes && assignment.questionTypes.length > 0 && (
          <div className="pt-3 border-t border-[var(--border-default)]">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Question Types</p>
            <div className="space-y-1.5">
              {assignment.questionTypes.map((qt, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">{qt.type}</span>
                  <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs">
                    <span>{qt.count} questions</span>
                    <span>{qt.marksPerQuestion} marks each</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Instructions */}
        {assignment.additionalInstructions && (
          <div className="pt-3 border-t border-[var(--border-default)]">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
              Additional Instructions
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {assignment.additionalInstructions}
            </p>
          </div>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex gap-3">
        {assignment.status === 'completed' && paper ? (
          <Button
            variant="dark-pill"
            size="lg"
            onClick={handleViewPaper}
            className="gap-2 flex-1"
          >
            View Question Paper
          </Button>
        ) : (
          <Button
            variant="dark-pill"
            size="lg"
            onClick={handleGenerate}
            loading={isGenerating}
            className="gap-2 flex-1"
          >
            <Wand2 className="w-4 h-4" />
            {assignment.status === 'failed' ? 'Retry Generation' : 'Generate Question Paper'}
          </Button>
        )}
      </div>
    </div>
  );
}
