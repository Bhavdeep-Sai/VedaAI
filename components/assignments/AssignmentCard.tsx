'use client';

import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Trash2, Calendar, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAssignmentStore } from '@/stores/assignment.store';
import type { Assignment } from '@/types/assignment.types';

interface AssignmentCardProps {
  assignment: Assignment;
}

const STATUS_BADGE_MAP: Record<
  Assignment['status'],
  'default' | 'queued' | 'processing' | 'completed' | 'failed'
> = {
  draft: 'default',
  queued: 'queued',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
};

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const router = useRouter();
  const { deleteAssignment, isDeleting } = useAssignmentStore();
  const isBeingDeleted = isDeleting === assignment._id;

  const handleView = () => {
    if (assignment.status === 'completed') {
      router.push(`/generated-paper/${assignment._id}`);
    } else {
      router.push(`/assignments/${assignment._id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteAssignment(assignment._id);
  };

  return (
    <div
      className={`bg-white border border-transparent shadow-sm md:shadow-card md:rounded-xl rounded-3xl p-5 cursor-pointer hover:shadow-md transition-all duration-200 animate-fade-in group ${
        isBeingDeleted ? 'opacity-50 pointer-events-none' : ''
      }`}
      onClick={handleView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleView()}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-[var(--text-primary)] text-sm md:text-sm text-[15px] leading-snug flex-1 min-w-0 group-hover:text-brand transition-colors">
          {assignment.title}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
            aria-label="Assignment options"
          >
            <MoreHorizontal className="w-5 h-5 md:w-4 md:h-4 text-black" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={handleView} className="gap-2">
              <Eye className="w-3.5 h-3.5" />
              View Assignment
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={handleDelete} className="gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Status Badge ─────────────────────────────────────── */}
      {assignment.status !== 'draft' && (
        <div className="mb-2">
          <Badge variant={STATUS_BADGE_MAP[assignment.status]} className="text-[11px]">
            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
          </Badge>
        </div>
      )}

      {/* ── Meta ─────────────────────────────────────────────── */}
      <div className="space-y-1.5 text-[12px] text-[var(--text-secondary)]">
        <div className="hidden md:block space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>
              <span className="text-[var(--text-muted)]">Assigned on: </span>
              {formatDate(assignment.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>
              <span className="text-[var(--text-muted)]">Due: </span>
              {formatDate(assignment.dueDate)}
            </span>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2 text-[11px] font-bold text-[var(--text-primary)] mt-2 pb-1">
          <span>Assigned on : {formatDate(assignment.createdAt).split(' ').join('-')}</span>
          <span>Due : {formatDate(assignment.dueDate).split(' ').join('-')}</span>
        </div>

        {assignment.totalQuestions > 0 && (
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            <span>
              {assignment.totalQuestions} questions · {assignment.totalMarks} marks
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
