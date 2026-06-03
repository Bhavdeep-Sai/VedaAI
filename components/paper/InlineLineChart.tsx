'use client';

interface InlineLineChartProps {
  headers: string[];
  rows: string[][];
}

/** Parses the numeric part out of a value like "15 cm", "20", "3" */
function toNumber(val: string): number {
  const n = parseFloat(val.replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}

export function InlineLineChart({ headers, rows }: InlineLineChartProps) {
  const values = rows.map((r) => toNumber(r[1]));
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);

  const CHART_W = 420;
  const CHART_H = 220;
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = 40;
  const PADDING_LEFT = 40;
  const PADDING_RIGHT = 20;

  const PLOT_W = CHART_W - PADDING_LEFT - PADDING_RIGHT;
  const PLOT_H = CHART_H - PADDING_TOP - PADDING_BOTTOM;

  // Calculate coordinates for each point
  const points = rows.map((row, i) => {
    const val = values[i];
    const x = PADDING_LEFT + (i / Math.max(rows.length - 1, 1)) * PLOT_W;
    // Invert Y axis so 0 is at the bottom
    const y = PADDING_TOP + PLOT_H - ((val - minVal) / (maxVal - minVal || 1)) * PLOT_H;
    return { x, y, label: row[0], val: row[1] };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="mt-3 mb-3">
      {/* Data table header label */}
      <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
        {headers[0]} / {headers[1]}
      </p>

      {/* SVG Line Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width={CHART_W}
          height={CHART_H}
          style={{ maxWidth: '100%', display: 'block' }}
          aria-label="Line chart"
        >
          {/* Y-axis grid lines & labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = PADDING_TOP + PLOT_H - frac * PLOT_H;
            const val = minVal + frac * (maxVal - minVal);
            return (
              <g key={frac}>
                <line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={CHART_W - PADDING_RIGHT}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray={frac === 0 ? '0' : '3 3'}
                />
                <text
                  x={PADDING_LEFT - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#6b7280"
                  fontFamily="inherit"
                >
                  {Number.isInteger(val) ? val : val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Data Points & X-axis labels */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Point Circle */}
              <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
              
              {/* Value label above point */}
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#374151"
                fontFamily="inherit"
              >
                {p.val}
              </text>

              {/* X-axis label */}
              <text
                x={p.x}
                y={CHART_H - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#4b5563"
                fontFamily="inherit"
                // Rotate long labels if there are many points, otherwise horizontal
                transform={rows.length > 5 ? `rotate(-45 ${p.x} ${CHART_H - 12})` : undefined}
                style={rows.length > 5 ? { transformBox: 'fill-box', transformOrigin: 'center' } : {}}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
