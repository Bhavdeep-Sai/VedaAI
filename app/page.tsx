import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, FileText, Zap, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* ── Background Glow ── */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[var(--brand-light)] to-transparent opacity-50 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--brand)] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="fixed z-10 w-full max-w-9xl mx-auto px-6 py-6 flex items-center ">
        <div className="flex items-center justify-center">
          <Image src="/logo.svg" alt="VedaAI Logo" width={200} height={50} className="w-auto h-18" priority />
        </div>
        <div className="text-[28px] h-15 font-bold flex items-center tracking-tight text-[#1c1c1c] leading-none">
          VedaAI
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <main className="relative z-10 w-full h-screen max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
          Create AI-Powered <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-orange-400">
            Question Papers
          </span>{' '}
          Instantly
        </h1>

        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
          Upload your study materials, configure your exact question distribution, and let VedaAI generate a professional assessment for your students in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/assignments"
            className="group flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[var(--brand)] text-white font-medium text-lg shadow-lg shadow-[var(--brand)]/25 hover:bg-[var(--brand-hover)] transition-all hover:scale-[1.02]"
          >
            Start Creating
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="https://github.com/Bhavdeep-Sai/VedaAI"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center h-14 px-8 rounded-full bg-white border border-[var(--border-default)] text-[var(--text-primary)] font-medium text-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            View Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
