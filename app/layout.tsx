import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'VedaAI — AI Assessment Creator',
    template: '%s | VedaAI',
  },
  description:
    'Create AI-powered question papers and assessments for your students with VedaAI. Upload study materials, configure question types, and generate professional question papers instantly.',
  keywords: ['AI assessment', 'question paper generator', 'teacher tools', 'education AI'],
  authors: [{ name: 'VedaAI' }],
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={bricolage.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased min-h-screen bg-[var(--bg-main)]">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-bricolage), sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
