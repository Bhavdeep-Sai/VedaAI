'use client';

import { usePathname } from 'next/navigation';

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className={`main-content print:block print:ml-0 pt-[90px] md:pt-0 pb-2 md:pb-0`}>
      {children}
    </div>
  );
}
