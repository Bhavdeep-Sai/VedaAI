'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, iconRight, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'input-base',
            icon && '!pl-10',
            iconRight && '!pr-10',
            error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
            className,
          )}
          ref={ref}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {iconRight}
          </div>
        )}
        {error && (
          <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
