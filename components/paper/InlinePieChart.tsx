'use client';

interface InlinePieChartProps {
  headers: string[];
  rows: string[][];
}

/** Parses the numeric part out of a value like "15 cm", "20", "3" */
function toNumber(val: string): number {
  const n = parseFloat(val.replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}

export function InlinePieChart({ headers, rows }: InlinePieChartProps) {
  const values = rows.map((r) => toNumber(r[1]));
  const total = values.reduce((sum, val) => sum + val, 0) || 1;

  const CHART_SIZE = 240;
  const CENTER = CHART_SIZE / 2;
  const RADIUS = CHART_SIZE / 2 - 10;
  
  // Color palette cycling
  const COLORS = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981',
    '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
  ];

  let cumulativeAngle = 0;

  return (
    <div className="mt-3 mb-3">
      <div className="flex flex-col sm:flex-row items-center gap-6 overflow-x-auto p-4">
        <div className="relative flex-shrink-0" style={{ width: CHART_SIZE, height: CHART_SIZE }}>
          <svg viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} width="100%" height="100%" aria-label="Pie chart">
            {values.map((val, i) => {
              if (val === 0) return null;
              
              const sliceAngle = (val / total) * 360;
              const startAngle = cumulativeAngle;
              const endAngle = startAngle + sliceAngle;
              cumulativeAngle = endAngle;

              // Convert angles from degrees to radians, subtract 90 to start from top
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);

              const x1 = CENTER + RADIUS * Math.cos(startRad);
              const y1 = CENTER + RADIUS * Math.sin(startRad);
              
              const x2 = CENTER + RADIUS * Math.cos(endRad);
              const y2 = CENTER + RADIUS * Math.sin(endRad);

              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const color = COLORS[i % COLORS.length];

              // Handle full circle case
              if (sliceAngle === 360) {
                return (
                  <circle
                    key={i}
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill={color}
                    opacity="0.9"
                  />
                );
              }

              return (
                <path
                  key={i}
                  d={`M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.9"
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 min-w-[200px] max-w-sm">
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wide">
            {headers[0]} / {headers[1]}
          </p>
          {rows.map((row, i) => {
            const val = values[i];
            const percentage = Math.round((val / total) * 100);
            const color = COLORS[i % COLORS.length];

            return (
              <div key={i} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: color, opacity: 0.9 }} 
                />
                <div className="flex-1 flex items-center gap-4">
                  <span className="text-sm text-[var(--text-primary)] truncate font-medium w-24">
                    {row[0]}
                  </span>
                  <div className="text-right flex-shrink-0 text-sm">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {row[1]}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] ml-2 inline-block w-8">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
