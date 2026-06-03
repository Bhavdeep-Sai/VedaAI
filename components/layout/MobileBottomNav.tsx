'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ClipboardList, Library, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutGrid },
  { href: '/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/toolkit', label: 'AI Toolkit', icon: Sparkles },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith('/assignments/create') || pathname.startsWith('/generated-paper')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden print:hidden">
      <div className="bg-[#111111] rounded-[24px] px-2 py-3 flex items-center justify-around shadow-lg">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 transition-colors",
                isActive ? "text-white" : "text-[#737373]"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px] font-medium tracking-tight", isActive ? "font-semibold" : "font-medium")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
