import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="text-8xl font-bold text-[var(--border-default)]">404</div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Page not found</h1>
        <p className="text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/assignments"
          className="btn btn-pill-dark inline-flex mt-4 px-8"
        >
          Go to Assignments
        </Link>
      </div>
    </div>
  );
}
