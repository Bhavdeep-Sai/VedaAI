'use client';

interface InlineBarChartProps {
  headers: string[];
  rows: string[][];
  isHistogram?: boolean;
}

/** Parses the numeric part out of a value like "15 cm", "20", "3" */
function toNumber(val: string): number {
  const n = parseFloat(val.replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}

export function InlineBarChart({ headers, rows, isHistogram = false }: InlineBarChartProps) {
  const values = rows.map((r) => toNumber(r[1]));
  const maxVal = Math.max(...values, 1);

  const CHART_W = 420;
  const BAR_H = isHistogram ? 38 : 28;
  const GAP = isHistogram ? 2 : 10;
  const LABEL_W = 90;
  const VALUE_W = 44;
  const BAR_AREA_W = CHART_W - LABEL_W - VALUE_W - 8;
  const CHART_H = rows.length * (BAR_H + GAP) + 36;

  // Color palette cycling
  const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  ];

  return (
    <div className="mt-3 mb-3">
      {/* Data table header label */}
      <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
        {headers[0]} / {headers[1]}
      </p>

      {/* SVG Bar Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width={CHART_W}
          height={CHART_H}
          style={{ maxWidth: '100%', display: 'block' }}
          aria-label="Data chart"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const x = LABEL_W + frac * BAR_AREA_W;
            return (
              <line
                key={frac}
                x1={x}
                y1={0}
                x2={x}
                y2={CHART_H - 24}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray={frac === 0 ? '0' : '3 3'}
              />
            );
          })}

          {rows.map((row, i) => {
            const val = values[i];
            const barW = maxVal > 0 ? (val / maxVal) * BAR_AREA_W : 0;
            const y = i * (BAR_H + GAP) + 4;
            const color = COLORS[i % COLORS.length];

            return (
              <g key={i}>
                {/* Label */}
                <text
                  x={LABEL_W - 6}
                  y={y + BAR_H / 2 + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#4b5563"
                  fontFamily="inherit"
                >
                  {row[0]}
                </text>

                {/* Bar background */}
                <rect
                  x={LABEL_W}
                  y={y}
                  width={BAR_AREA_W}
                  height={BAR_H}
                  fill="#f3f4f6"
                  rx="4"
                />

                {/* Bar fill */}
                <rect
                  x={LABEL_W}
                  y={y}
                  width={Math.max(barW, 4)}
                  height={BAR_H}
                  fill={color}
                  rx="4"
                  opacity="0.85"
                />

                {/* Value label */}
                <text
                  x={LABEL_W + BAR_AREA_W + 6}
                  y={y + BAR_H / 2 + 4}
                  fontSize="11"
                  fill="#374151"
                  fontWeight="600"
                  fontFamily="inherit"
                >
                  {row[1]}
                </text>
              </g>
            );
          })}

          {/* X-axis baseline */}
          <line
            x1={LABEL_W}
            y1={rows.length * (BAR_H + GAP) + 6}
            x2={LABEL_W + BAR_AREA_W}
            y2={rows.length * (BAR_H + GAP) + 6}
            stroke="#9ca3af"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
