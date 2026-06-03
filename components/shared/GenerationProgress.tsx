'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGenerationStore } from '@/stores/generation.store';
import { useGenerationSSE } from '@/hooks/useGenerationSSE';

interface GenerationProgressProps {
  assignmentId: string;
  onViewPaper?: () => void;
  onRetry?: () => void;
}

const STAGE_MESSAGES: { threshold: number; label: string }[] = [
  { threshold: 0, label: 'Initializing generation...' },
  { threshold: 10, label: 'Fetching assignment details...' },
  { threshold: 25, label: 'Analyzing document content...' },
  { threshold: 45, label: 'Generating questions with AI...' },
  { threshold: 75, label: 'Validating and structuring paper...' },
  { threshold: 90, label: 'Saving question paper...' },
  { threshold: 100, label: 'Question paper ready! 🎉' },
];

function getStageLabel(progress: number): string {
  const stage = [...STAGE_MESSAGES].reverse().find((s) => progress >= s.threshold);
  return stage?.label ?? 'Processing...';
}

export function GenerationProgress({
  assignmentId,
  onViewPaper,
  onRetry,
}: GenerationProgressProps) {
  const {
    progress,
    message,
    isGenerating,
    hasCompleted,
    hasFailed,
    failureReason,
    isConnected,
  } = useGenerationStore();

  const router = useRouter();

  useGenerationSSE(assignmentId, {
    onCompleted: (paperId) => {
      console.log('[GenerationProgress] Paper ready:', paperId);
    },
    onFailed: (error) => {
      console.error('[GenerationProgress] Generation failed:', error);
    },
  });

  // Auto-navigate on completion
  useEffect(() => {
    if (hasCompleted) {
      const timer = setTimeout(() => {
        onViewPaper?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCompleted, onViewPaper]);

  const displayProgress = hasCompleted ? 100 : hasFailed ? 0 : progress;
  const displayMessage = message || getStageLabel(progress);

  return (
    <div className="card p-8 animate-fade-in">
      {hasFailed ? (
        // ── Failure State ──────────────────────────────────────
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-[var(--danger)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Generation Failed
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
              {failureReason ?? 'Something went wrong. Please try again.'}
            </p>
          </div>
          <Button
            variant="default"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      ) : hasCompleted ? (
        // ── Success State ──────────────────────────────────────
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[var(--success-light)] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[var(--success)]" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Question Paper Ready!
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Your AI-generated question paper is ready to view.
            </p>
          </div>
          <Button
            variant="dark-pill"
            size="lg"
            onClick={onViewPaper}
            className="gap-2 px-8"
          >
            View Question Paper
            <ExternalLink className="w-4 h-4" />
          </Button>
          <p className="text-xs text-[var(--text-muted)]">Redirecting automatically...</p>
        </div>
      ) : (
        // ── In-Progress State ──────────────────────────────────
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Generating Your Question Paper
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              AI is analyzing your document and creating questions...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={displayProgress} />
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                {!isConnected && (
                  <span className="w-1.5 h-1.5 bg-[var(--warning)] rounded-full animate-pulse" />
                )}
                {isConnected && (
                  <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full" />
                )}
                {displayMessage}
              </span>
              <span className="text-[var(--text-muted)] font-medium tabular-nums">
                {displayProgress}%
              </span>
            </div>
          </div>

          {/* Stage Steps */}
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Document Analysis', done: progress >= 25 },
              { label: 'AI Question Generation', done: progress >= 75 },
              { label: 'Validation & Structuring', done: progress >= 90 },
              { label: 'Saving to Database', done: progress >= 100 },
            ].map((stage, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    stage.done
                      ? 'bg-brand border-brand'
                      : 'border-[var(--border-default)] bg-white'
                  }`}
                >
                  {stage.done && (
                    <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1.5 4L3 5.5L6.5 2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    stage.done ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-[var(--text-muted)]">
            This usually takes 30–60 seconds
          </p>
        </div>
      )}
    </div>
  );
}
