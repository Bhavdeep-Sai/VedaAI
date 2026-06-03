'use client';

import { SectionBlock } from './SectionBlock';
import type { GeneratedPaper } from '@/types/paper.types';

interface PaperViewerProps {
  paper: GeneratedPaper;
  headerLayout?: 'layout-1' | 'layout-2' | 'layout-3';
}

export function PaperViewer({ paper, headerLayout = 'layout-1' }: PaperViewerProps) {
  const { metadata, sections } = paper;

  return (
    <div id="paper-content" className="paper-container">
      {/* ── School Header ─────────────────────────────────────── */}
      <div className="mb-4">
        <h1 className="paper-school-name text-center mb-1">{metadata.schoolName}</h1>
        {headerLayout === 'layout-1' && (
          <div className="flex justify-between font-medium text-sm">
            <span className="paper-meta">Subject: {metadata.subject}</span>
            <span className="paper-meta">Class: {metadata.className}</span>
            <span>Time Allowed: {metadata.timeAllowed}</span>
          </div>
        )}
        {headerLayout === 'layout-2' && (
          <div className="text-center font-medium text-sm space-y-0.5">
            <div className="paper-meta">{metadata.subject} - Class {metadata.className}</div>
            <div>Time Allowed: {metadata.timeAllowed} | Maximum Marks: {metadata.maxMarks}</div>
          </div>
        )}
        {headerLayout === 'layout-3' && (
          <div className="flex flex-col gap-1 font-medium text-sm">
            <div className="flex justify-between">
              <span className="paper-meta">Class: {metadata.className}</span>
              <span>Time Allowed: {metadata.timeAllowed}</span>
            </div>
            <div className="flex justify-between">
              <span className="paper-meta">Subject: {metadata.subject}</span>
              <span>Maximum Marks: {metadata.maxMarks}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Time / Marks Bar (Only for Layout 1) ──────────────── */}
      {headerLayout === 'layout-1' && (
        <div className="paper-info-bar">
          <span>Maximum Marks: {metadata.maxMarks}</span>
        </div>
      )}

      {/* ── General Instructions ──────────────────────────────── */}
      <p className="text-sm italic mb-3">
        All questions are compulsory unless stated otherwise.
      </p>

      {/* ── Student Info Fields ───────────────────────────────── */}
      <div className="paper-student-fields">
        <div>
          Name: <span className="inline-block w-32 border-b border-[var(--text-primary)] ml-1" />
        </div>
        <div>
          Roll Number: <span className="inline-block w-20 border-b border-[var(--text-primary)] ml-1" />
        </div>
        <div>
          Class: {metadata.className} Section:{' '}
          <span className="inline-block w-10 border-b border-[var(--text-primary)] ml-1" />
        </div>
      </div>

      {/* ── Sections ─────────────────────────────────────────── */}
      <div className="mt-6 space-y-4">
        {sections.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}
      </div>

      {/* ── End of Paper ─────────────────────────────────────── */}
      <div className="text-center mt-8 mb-6">
        <p className="text-sm font-medium border-t pt-4 border-[var(--border-default)]">
          End of Question Paper
        </p>
      </div>

      {/* ── Answer Key ───────────────────────────────────────── */}
      <div className="mt-6 pt-6 border-t-2 border-dashed border-[var(--border-default)] print:break-before-page print:mt-0 print:border-t-0 print:pt-0">
        <h2 className="text-base font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          Answer Key:
        </h2>
        <div className="space-y-4">
          {sections.map((section, si) => (
            <div key={si}>
              <h3 className="text-sm font-semibold mb-2 text-[var(--text-secondary)]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.questions.map((q) => (
                  <div key={q.number} className="flex gap-2 text-sm">
                    <span className="font-medium flex-shrink-0 w-6">{q.number}.</span>
                    <span className="text-[var(--text-secondary)]">{q.answer}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
