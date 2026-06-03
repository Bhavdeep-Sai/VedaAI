'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('skeleton-shimmer rounded-md', className)}
      {...props}
    />
  ),
);
Skeleton.displayName = 'Skeleton';

export function AssignmentCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function AssignmentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <AssignmentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PaperViewerSkeleton() {
  return (
    <div className="paper-container space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-6 w-2/3 mx-auto" />
        <Skeleton className="h-4 w-1/3 mx-auto" />
        <Skeleton className="h-4 w-1/4 mx-auto" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-full' : 'w-11/12'}`} />
        ))}
      </div>
    </div>
  );
}

export { Skeleton };
