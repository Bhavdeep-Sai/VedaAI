'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { GeneratedPaper } from '@/types/paper.types';

interface ExportButtonProps {
  paper: GeneratedPaper;
  className?: string;
  onExport: () => void;
}

export function ExportButton({ paper, className, onExport }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    // Slight delay to allow UI to update 
    setTimeout(() => {
      try {
        onExport();
      } catch (error) {
        console.error('[Export] Print failed:', error);
        toast.error('Failed to open print dialog. Please try again.');
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  return (
    <Button
      onClick={handleExport}
      loading={isExporting}
      variant="ghost"
      size="sm"
      className={className}
      id="download-pdf-btn"
    >
      <Download className="w-4 h-4" />
      Download as PDF
    </Button>
  );
}
