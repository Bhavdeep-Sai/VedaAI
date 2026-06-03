'use client';

import { Badge } from '@/components/ui/badge';
import type { PaperQuestion } from '@/types/paper.types';
import { InlineBarChart } from './InlineBarChart';
import { InlinePieChart } from './InlinePieChart';
import { InlineLineChart } from './InlineLineChart';

interface QuestionItemProps {
  question: PaperQuestion;
  showAnswer?: boolean;
  sectionType?: string;
}

const DIFFICULTY_BADGE_MAP: Record<string, 'easy' | 'moderate' | 'challenging'> = {
  Easy: 'easy',
  Moderate: 'moderate',
  Challenging: 'challenging',
};

// ─── Match the Following Parser ────────────────────────────────────────────────
interface MatchData {
  colALabel: string;
  colBLabel: string;
  colA: string[];
  colB: string[];
  questionPrefix: string;
}

function parseMatchTheFollowing(text: string): MatchData | null {
  // Matches "Column I:", "Column II:", "Column A", "Column B", "Column 1", "Column 2"
  const colPattern =
    /(Column\s+(?:I{1,3}|[A-Z1-9]))[:\s]+([\s\S]+?)\s*(Column\s+(?:I{1,3}|[A-Z1-9]))[:\s]+([\s\S]+)/i;

  const match = text.match(colPattern);
  if (!match) return null;

  const colALabel = match[1].trim();
  const colBLabel = match[3].trim();
  const colARaw = match[2];
  const colBRaw = match[4];

  // Try to split by prefixes like "1)", "2)" or "A)", "B)", fallback to splitting by newline
  const splitA = colARaw.split(/(?=\b\d+\))/);
  const colA = (splitA.length > 1 ? splitA : colARaw.split('\n'))
    .map((s) => s.trim())
    .filter(Boolean);

  const splitB = colBRaw.split(/(?=\b[A-Z]\))/);
  const colB = (splitB.length > 1 ? splitB : colBRaw.split('\n'))
    .map((s) => s.trim())
    .filter(Boolean);

  const questionPrefix = text.substring(0, match.index ?? 0).trim();

  return { colALabel, colBLabel, colA, colB, questionPrefix };
}

// ─── Inline Data Table Parser (for diagram/graph questions) ──────────────────
interface DataTable {
  label: string;
  headers: string[];
  rows: string[][];
}

/**
 * Tries to extract a data table from the inline question text.
 * Looks for data introduced by a colon, split by commas.
 * Handles many formats: "Jan-10", "Anil (8)", "Flowers (25%)", "0-10 (2 students)", "6 years (2 children)"
 */
function parseInlineDataTable(text: string): DataTable | null {
  // Must have a colon that introduces the data portion
  const colonIdx = text.indexOf(':');
  if (colonIdx === -1) return null;

  const dataPortion = text.substring(colonIdx + 1);
  // Split by commas, trim each item, strip leading "and " conjunction, drop empty
  const items = dataPortion
    .split(',')
    .map((s) => s.trim().replace(/^and\s+/i, '').trim())
    .filter(Boolean);
  if (items.length < 3) return null;

  // Pattern 1: "digit-range (count unit)" e.g. "0-10 (2 students)", "11-20 (5 students)"
  // Must start with a digit and have hyphen-separated range
  const rangeMatches = items
    .map((item) => item.match(/^(\d+(?:-\d+)?)\s*\((\d+)\s*\w*\)/))
    .filter(Boolean);
  if (rangeMatches.length >= 3) {
    return {
      label: '',
      headers: ['Range', 'Frequency'],
      rows: rangeMatches.map((m) => [m![1].trim(), m![2].trim()]),
    };
  }

  // Pattern 2: "Label-value unit" e.g. "Jan-10", "Feb-12", "Plant A-15 cm"
  const dashMatches = items
    .map((item) => item.match(/^([\w][\w\s]{0,14}?)\s*-\s*(\d+(?:\.\d+)?(?:\s*(?:cm|kg|m|%))?)/))
    .filter(Boolean);
  if (dashMatches.length >= 3) {
    return {
      label: '',
      headers: ['Category', 'Value'],
      rows: dashMatches.map((m) => [m![1].trim(), m![2].trim()]),
    };
  }

  // Pattern 3: "Label (value [unit])" e.g. "Anil (8)", "Flowers (25%)", "6 years (2 children)"
  // The label can be a name, a digit+word, or any short phrase
  const namedValueMatches = items
    .map((item) => item.match(/^([\w][\w\s]{0,20}?)\s*\((\d+(?:\.\d+)?%?)\s*\w*\)/))
    .filter(Boolean);
  if (namedValueMatches.length >= 3) {
    const firstVal = namedValueMatches[0]![2] as string;
    const isPercent = firstVal.includes('%');
    return {
      label: '',
      headers: ['Category', isPercent ? 'Percentage' : 'Value'],
      rows: namedValueMatches.map((m) => [m![1].trim(), m![2].trim()]),
    };
  }

  // Pattern 4: "label: value" within each item e.g. "Math: 25, Science: 30"
  const colonMatches = items
    .map((item) => item.match(/^([\w][\w\s]{0,20}?):\s*(\d+(?:\.\d+)?(?:\s*(?:cm|kg|m|%|°))?)/))
    .filter(Boolean);
  if (colonMatches.length >= 2) {
    return {
      label: '',
      headers: ['Category', 'Value'],
      rows: colonMatches.map((m) => [m![1].trim(), m![2].trim()]),
    };
  }

  return null;
}


function isDiagramSection(sectionType?: string): boolean {
  if (!sectionType) return false;
  const t = sectionType.toLowerCase();
  return (
    t.includes('diagram') ||
    t.includes('graph') ||
    t.includes('chart') ||
    t.includes('data') ||
    t.includes('figure')
  );
}

export function QuestionItem({ question, showAnswer = false, sectionType }: QuestionItemProps) {
  // Normalise escape sequences the AI sometimes emits
  const normalizedText = question.text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

  let mainText = normalizedText;
  let matchData: MatchData | null = null;
  let dataTable: DataTable | null = null;
  let inlineOptions: string[] = [];
  let isPieChart = false;
  let isLineChart = false;
  let isHistogram = false;

  // ── 1. Match the Following detection ──────────────────────────────────────
  matchData = parseMatchTheFollowing(mainText);
  if (matchData) {
    mainText = matchData.questionPrefix;
  } else {
    // ── 2. Diagram/graph data table detection ──────────────────────────────
    if (question.chartData) {
      dataTable = {
        label: '',
        headers: question.chartData.headers,
        rows: question.chartData.rows,
      };
      isPieChart = question.chartData.type === 'pie';
      isLineChart = question.chartData.type === 'line';
      isHistogram = question.chartData.type === 'histogram';
    } else if (isDiagramSection(sectionType)) {
      // Fallback for older papers without structured chartData
      dataTable = parseInlineDataTable(mainText);
      if (dataTable) {
        isPieChart = /pie\s*(?:chart|graph)/i.test(mainText);
        isLineChart = /line\s*(?:plot|graph)|distance-time/i.test(mainText);
        isHistogram = /histogram/i.test(mainText);
      }
    }

    // ── 3. MCQ inline options (only if not match-the-following) ───────────
    if (!dataTable) {
      const parts = mainText.split(/(?=\s+(?:[A-Ea-e]\)|\([A-Ea-e]\)|[A-Ea-e]\.))\s+/);
      if (parts.length >= 3) {
        const isValidSequence = parts.slice(1).every((part, i) => {
          const m = part.trim().match(/^(?:([A-Ea-e])\)|\(([A-Ea-e])\)|([A-Ea-e])\.)\ +/);
          if (!m) return false;
          const letter = (m[1] || m[2] || m[3]).toUpperCase();
          return letter.charCodeAt(0) === 65 + i;
        });
        if (isValidSequence) {
          mainText = parts[0].trim();
          inlineOptions = parts.slice(1).map((o) => o.trim());
        }
      }
    }
  }

  return (
    <div className="paper-question">
      <div className="flex gap-2">
        <span className="font-medium text-[var(--text-primary)] flex-shrink-0">
          {question.number}.
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-[var(--text-muted)] text-xs mr-1.5">
            [{question.difficulty}]
          </span>
          <span className="text-[var(--text-primary)] whitespace-pre-wrap">{mainText}</span>
          <span className="text-[var(--text-muted)] text-xs ml-2 whitespace-nowrap">
            [{question.marks} Mark{question.marks !== 1 ? 's' : ''}]
          </span>

          {/* ── Match the Following table ── */}
          {matchData && (
            <div className="mt-4 mb-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="py-2.5 px-5 font-semibold text-[var(--text-primary)] w-1/2 border-b border-r border-[var(--border-subtle)]">
                      {matchData.colALabel}
                    </th>
                    <th className="py-2.5 px-5 font-semibold text-[var(--text-primary)] w-1/2 border-b border-[var(--border-subtle)]">
                      {matchData.colBLabel}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({
                    length: Math.max(matchData.colA.length, matchData.colB.length),
                  }).map((_, i) => (
                    <tr
                      key={i}
                      className={`border-b border-[var(--border-subtle)] last:border-0 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}
                    >
                      <td className="py-2 px-5 text-[var(--text-primary)] align-top border-r border-[var(--border-subtle)]">
                        {matchData!.colA[i] || ''}
                      </td>
                      <td className="py-2 px-5 text-[var(--text-primary)] align-top">
                        {matchData!.colB[i] || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Diagram/Graph visual chart ── */}
          {dataTable && (
            isPieChart ? (
              <InlinePieChart headers={dataTable.headers} rows={dataTable.rows} />
            ) : isLineChart ? (
              <InlineLineChart headers={dataTable.headers} rows={dataTable.rows} />
            ) : (
              <InlineBarChart headers={dataTable.headers} rows={dataTable.rows} isHistogram={isHistogram} />
            )
          )}

          {/* ── MCQ inline options ── */}
          {inlineOptions.length > 0 && (
            <div className="mt-3 mb-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pl-1">
              {inlineOptions.map((opt, i) => (
                <div key={i} className="text-sm text-[var(--text-primary)]">
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sub-parts */}
      {question.subParts && question.subParts.length > 0 && (
        <div className="ml-6 mt-2 space-y-1">
          {question.subParts.map((part, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-[var(--text-muted)] flex-shrink-0">
                ({String.fromCharCode(97 + i)})
              </span>
              <span className="whitespace-pre-wrap">{part.replace(/\\n/g, '\n').replace(/\\t/g, '\t')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Answer (for answer key section) */}
      {showAnswer && question.answer && (
        <div className="ml-6 mt-1.5 text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[var(--success-light)]">
          <span className="font-medium text-[var(--success)]">Ans: </span>
          <span className="whitespace-pre-wrap">{question.answer.replace(/\\n/g, '\n').replace(/\\t/g, '\t')}</span>
        </div>
      )}
    </div>
  );
}
