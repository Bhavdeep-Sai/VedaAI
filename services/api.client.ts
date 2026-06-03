import type { Assignment, CreateAssignmentPayload } from '@/types/assignment.types';
import type { GeneratedPaper } from '@/types/paper.types';

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) {
    throw new ApiError(json.error || 'API Request failed', res.status);
  }
  return json.data;
}

export const apiClient = {
  assignments: {
    list: async (query?: string): Promise<{ items: Assignment[]; total: number } | Assignment[]> => {
      const url = query ? `/api/assignments?q=${encodeURIComponent(query)}` : '/api/assignments';
      const res = await fetch(url);
      return handleResponse(res);
    },
    create: async (data: CreateAssignmentPayload & { fileContent?: string }): Promise<Assignment> => {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id: string): Promise<void> => {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      return handleResponse(res);
    },
  },
  generation: {
    start: async (assignmentId: string): Promise<{ jobId: string; assignmentId: string }> => {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId }),
      });
      return handleResponse(res);
    },
    getPaper: async (paperId: string): Promise<GeneratedPaper> => {
      const res = await fetch(`/api/papers/${paperId}`);
      return handleResponse(res);
    },
  },
};
