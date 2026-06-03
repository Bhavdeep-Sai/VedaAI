export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Upload response
export interface UploadResponse {
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'txt';
  fileSize: number;
  extractedText: string;
  wordCount: number;
}

// Generate response
export interface GenerateResponse {
  jobId: string;
  assignmentId: string;
  message: string;
}

// Status response
export interface StatusResponse {
  jobId: string;
  assignmentId: string;
  status: string;
  progress: number;
  message: string;
  paperId?: string;
  error?: string;
}
