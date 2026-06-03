'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <div className="flex flex-col h-100% items-center justify-center pt-20 px-6 animate-fade-in">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="relative w-75 h-75 flex justify-center items-center">
          <Image
            src="/Illustrations.svg"
            alt="No assignments found"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Text */}
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        No assignments yet
      </h2>
      <p className="text-sm text-[var(--text-secondary)] text-center max-w-xl mb-8 leading-relaxed">
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      {/* CTA */}
      <Link href="/assignments/create">
        <Button variant="dark-pill" size="lg" className="gap-2 px-8">
          <Plus className="w-4 h-4" />
          Create Your First Assignment
        </Button>
      </Link>
    </div>
  );
}
