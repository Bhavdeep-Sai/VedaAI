'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand text-white hover:bg-brand-hover shadow-sm',
        dark: 'bg-[#18181b] text-white hover:bg-[#09090b]',
        'dark-pill': 'bg-[#18181b] text-white hover:bg-[#09090b] rounded-full',
        ghost:
          'bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)]',
        outline:
          'border border-[var(--border-default)] bg-white text-[var(--text-primary)] hover:bg-[var(--bg-main)]',
        danger:
          'bg-transparent text-[var(--danger)] hover:bg-[var(--danger-light)] border-none',
        link: 'text-brand underline-offset-4 hover:underline p-0 h-auto',
        secondary:
          'bg-[var(--bg-main)] text-[var(--text-primary)] hover:bg-[var(--border-default)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-9 px-4 rounded-lg',
        lg: 'h-11 px-6 rounded-lg text-base',
        icon: 'h-8 w-8 rounded-md p-0',
        'icon-sm': 'h-6 w-6 rounded p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="spinner-sm spinner mr-1" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
