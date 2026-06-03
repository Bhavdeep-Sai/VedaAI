'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose', // necessary for some complex AI generated diagrams
  fontFamily: 'inherit',
});

interface MermaidChartProps {
  chart: string;
}

export function MermaidChart({ chart }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    const renderChart = async () => {
      try {
        setError(null);
        // Generate a unique ID for this mermaid instance
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        
        // Render the SVG
        const { svg } = await mermaid.render(id, chart);
        
        // Inject safely
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (e) {
        console.error('Mermaid rendering failed:', e);
        setError('Failed to render chart');
        // Clear the container on error so it doesn't show broken SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      }
    };

    renderChart();
  }, [chart]);

  if (!chart) return null;

  return (
    <div className="my-6 flex flex-col items-center justify-center w-full bg-slate-50/50 rounded-lg p-4 border border-slate-100">
      <div 
        ref={containerRef} 
        className="mermaid-container w-full overflow-x-auto flex justify-center"
      />
      {error && (
        <div className="text-sm text-red-500 mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
