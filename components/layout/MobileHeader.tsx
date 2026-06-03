'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell, Menu } from 'lucide-react';

export function MobileHeader() {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:hidden">
      <div className="bg-white rounded-[28px] px-5 py-3 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="VedaAI Logo"
            width={32}
            height={32}
            className="w-auto h-8"
            priority
          />
          <span className="text-[20px] font-bold tracking-tight text-[#1c1c1c] leading-none">
            VedaAI
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="relative flex items-center justify-center w-9 h-9 bg-gray-50 rounded-full text-[var(--text-secondary)]">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-2 border-white bg-[#ff5e00] rounded-full" />
          </button>
          
          <div className="w-9 h-9 rounded-full overflow-hidden relative border border-gray-100">
            <Image src="/user.jpg" alt="User Profile" fill className="object-cover" />
          </div>

          <button className="text-[var(--text-secondary)] pl-1">
            <Menu className="w-6 h-6 text-black" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
