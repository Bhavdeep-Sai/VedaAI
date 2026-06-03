'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutGrid, Bell, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  subtitle?: string;
  showDot?: boolean;
  actions?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  backHref,
  subtitle,
  showDot = false,
  actions,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="page-header print:hidden md:bg-[var(--bg-sidebar)] bg-transparent border-none md:border-solid md:border-b z-40">
      {/* ── Left: Back + Title ───────────────────────────────── */}
      <div className="flex items-center gap-3 flex-1 min-w-0 md:pl-0 pl-2 justify-center md:justify-start relative">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white md:bg-transparent shadow-sm md:shadow-none hover:bg-[var(--bg-main)] transition-colors text-[var(--text-secondary)] flex-shrink-0 absolute left-2 md:static z-10"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
        )}

        {title && (
          <div className="flex items-center gap-2 min-w-0 w-full">
            <div className="min-w-0 flex flex-col md:flex-row items-center justify-center w-full md:gap-2 px-12 md:px-0 text-center">
              <h1 className="text-base md:text-sm font-semibold md:font-medium text-[var(--text-primary)] truncate w-full">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[10px] md:text-xs text-[var(--text-muted)] truncate w-full">{subtitle}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Actions + User ────────────────────────────── */}
      <div className="hidden md:flex items-center gap-3 ml-4 flex-shrink-0">
        {actions}

        {/* Notification Bell */}
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--bg-main)] transition-colors text-[var(--text-secondary)]"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {showDot && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
          )}
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-main)] transition-colors">
          <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden relative">
            <Image src="/user.jpg" alt="John Doe" fill className="object-cover" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">John Doe</span>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </button>
      </div>
    </header>
  );
}
