'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-default)]',
        brand: 'bg-[var(--brand-light)] text-[var(--brand)]',
        success: 'bg-[var(--success-light)] text-[var(--success)]',
        warning: 'bg-[var(--warning-light)] text-[var(--warning)]',
        danger: 'bg-[var(--danger-light)] text-[var(--danger)]',
        dark: 'bg-[#18181b] text-white',
        easy: 'bg-[var(--easy-bg)] text-[var(--easy)]',
        moderate: 'bg-[var(--warning-light)] text-[var(--warning)]',
        challenging: 'bg-[var(--danger-light)] text-[var(--danger)]',
        queued: 'bg-[var(--info-light)] text-[var(--info)]',
        processing: 'bg-[var(--warning-light)] text-[var(--warning)]',
        completed: 'bg-[var(--success-light)] text-[var(--success)]',
        failed: 'bg-[var(--danger-light)] text-[var(--danger)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
