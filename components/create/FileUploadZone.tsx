'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, FileCheck2, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onUploadSuccess: (data: {
    fileUrl: string;
    fileName: string;
    fileType: 'pdf' | 'txt';
    fileSize: number;
    extractedText: string;
    wordCount: number;
  }) => void;
  onUploadError?: (error: string) => void;
  currentFile?: { name: string; size: number; type: string } | null;
  onClear?: () => void;
}

const ALLOWED_MIME = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
};

export function FileUploadZone({
  onUploadSuccess,
  onUploadError,
  currentFile,
  onClear,
}: FileUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setProgress((p) => Math.min(p + 15, 85));
        }, 200);

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error);
        }

        onUploadSuccess(json.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        onUploadError?.(message);
      } finally {
        setIsUploading(false);
        setTimeout(() => setProgress(0), 500);
      }
    },
    [onUploadSuccess, onUploadError],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      if (rejectedFiles && (rejectedFiles as File[]).length > 0) {
        setError('Invalid file type or size. Only PDF and TXT files up to 10MB are allowed.');
        return;
      }
      if (acceptedFiles[0]) {
        uploadFile(acceptedFiles[0]);
      }
    },
    [uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_MIME,
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled: isUploading,
  });

  if (currentFile) {
    return (
      <div className="upload-zone has-file flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <FileCheck2 className="w-5 h-5 text-[var(--success)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {currentFile.name}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {formatFileSize(currentFile.size)} · {currentFile.type.toUpperCase()}
            </p>
          </div>
          {onClear && (
            <button
              onClick={onClear}
              className="p-1.5 rounded-lg hover:bg-white/50 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors flex-shrink-0"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--success)]">File uploaded successfully</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          'upload-zone cursor-pointer',
          isDragActive && 'drag-active',
          isUploading && 'pointer-events-none',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <>
              <div className="spinner" />
              <p className="text-sm text-[var(--text-secondary)]">Uploading... {progress}%</p>
              <div className="progress-track w-48">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[var(--bg-main)] flex items-center justify-center">
                <UploadCloud className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {isDragActive ? 'Drop your file here' : 'Choose a file or drag & drop it here'}
                </p>
                <p className="text-xs text-[var(--text-muted)]">JPEG, PNG, up to 10MB</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="pointer-events-none"
              >
                Browse Files
              </Button>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-center text-[var(--text-muted)]">
        Upload images of your preferred document/image
      </p>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--danger-light)] rounded-lg text-[var(--danger)] text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
