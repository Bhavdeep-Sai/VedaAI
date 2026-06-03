'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PaperViewer } from './PaperViewer';
import { ExportButton } from './ExportButton';
import { GenerationProgress } from '@/components/shared/GenerationProgress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useGenerationStore } from '@/stores/generation.store';
import type { Assignment } from '@/types/assignment.types';
import type { GeneratedPaper } from '@/types/paper.types';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface GeneratedPaperPageProps {
  assignment: Assignment;
  paper: GeneratedPaper | null;
  assignmentId: string;
}

export function GeneratedPaperPage({ assignment, paper: initialPaper, assignmentId }: GeneratedPaperPageProps) {
  const router = useRouter();
  const { startGeneration, isGenerating, hasCompleted, paper: generatedPaper } = useGenerationStore();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showGenerationUI, setShowGenerationUI] = useState(false);

  // Use newly generated paper or initial server-provided paper
  const activePaper = generatedPaper ?? initialPaper;
  const paperRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: paperRef,
    documentTitle: activePaper ? `${activePaper.metadata.subject.replace(/\s+/g, '_')}_${activePaper.metadata.className.replace(/\s+/g, '_')}_QuestionPaper` : 'QuestionPaper',
  });

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setShowGenerationUI(true);
    try {
      await startGeneration(assignmentId);
    } catch (error) {
      setIsRegenerating(false);
      setShowGenerationUI(false);
      toast.error(error instanceof Error ? error.message : 'Failed to start regeneration');
    }
  };

  const handleViewPaper = () => {
    setShowGenerationUI(false);
    router.refresh();
  };

  // Still generating — show progress
  if (showGenerationUI && !hasCompleted) {
    return (
      <div className="max-w-2xl mx-auto">
        <GenerationProgress
          assignmentId={assignmentId}
          onViewPaper={handleViewPaper}
          onRetry={() => startGeneration(assignmentId)}
        />
      </div>
    );
  }

  // No paper and not generating
  if (!activePaper && !isGenerating) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            No Question Paper Found
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Generate a question paper for this assignment.
          </p>
          <Button
            onClick={handleRegenerate}
            variant="dark-pill"
            size="lg"
            className="gap-2 px-8"
          >
            <Eye className="w-4 h-4" />
            Generate Paper
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Actions Bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {assignment.title}
            </h2>
            {activePaper && (
              <p className="text-xs text-[var(--text-muted)]">
                Generated {formatDate(activePaper.generatedAt)} · Version {activePaper.version}
              </p>
            )}
          </div>
          {assignment.status === 'completed' && (
            <Badge variant="completed">Completed</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activePaper && <ExportButton paper={activePaper} onExport={() => handlePrint()} />}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            loading={isRegenerating && !hasCompleted}
            className="gap-1.5"
            id="regenerate-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* ── Paper Viewer ─────────────────────────────────────── */}
      <div ref={paperRef}>
        {activePaper && <PaperViewer paper={activePaper} headerLayout={assignment.headerLayout} />}
      </div>
    </div>
  );
}
