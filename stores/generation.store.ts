'use client';

import { create } from 'zustand';
import { apiClient } from '@/services/api.client';
import type { GeneratedPaper, GenerationStatus, SSEEvent } from '@/types/paper.types';

interface GenerationStore {
  // State
  status: GenerationStatus | null;
  progress: number;
  message: string;
  paper: GeneratedPaper | null;
  jobId: string | null;
  assignmentId: string | null;
  isGenerating: boolean;
  isConnected: boolean;
  hasCompleted: boolean;
  hasFailed: boolean;
  failureReason: string | null;

  // Actions
  startGeneration: (assignmentId: string) => Promise<string>;
  updateFromSSE: (event: SSEEvent) => void;
  setPaper: (paper: GeneratedPaper) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialState = {
  status: null,
  progress: 0,
  message: '',
  paper: null,
  jobId: null,
  assignmentId: null,
  isGenerating: false,
  isConnected: false,
  hasCompleted: false,
  hasFailed: false,
  failureReason: null,
};

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  ...initialState,

  startGeneration: async (assignmentId: string) => {
    set({
      isGenerating: true,
      assignmentId,
      progress: 0,
      message: 'Initializing...',
      hasCompleted: false,
      hasFailed: false,
      failureReason: null,
      paper: null,        // ← clear stale paper so it never bleeds into a fresh generation
      jobId: null,
    });

    try {
      const { jobId } = await apiClient.generation.start(assignmentId);
      set({ jobId });
      return jobId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start generation';
      set({ isGenerating: false, hasFailed: true, failureReason: message });
      throw error;
    }
  },

  updateFromSSE: (event: SSEEvent) => {
    const { type, progress, message } = event;

    switch (type) {
      case 'generation-started':
        set({ progress, message, isGenerating: true });
        break;

      case 'generation-progress':
        set({ progress, message });
        break;

      case 'generation-completed': {
        const completedEvent = event as SSEEvent & { paperId: string };
        set({
          progress: 100,
          message: 'Question paper ready!',
          isGenerating: false,
          hasCompleted: true,
        });
        // Fetch the paper
        if (completedEvent.paperId) {
          apiClient.generation.getPaper(completedEvent.paperId)
            .then((paper) => {
              set({ paper });
            })
            .catch(console.error);
        }
        break;
      }

      case 'generation-failed': {
        const failedEvent = event as SSEEvent & { error: string };
        set({
          progress: 0,
          message: message || 'Generation failed',
          isGenerating: false,
          hasFailed: true,
          failureReason: failedEvent.error || message,
        });
        break;
      }
    }
  },

  setPaper: (paper) => set({ paper }),

  setConnected: (connected) => set({ isConnected: connected }),

  reset: () => set(initialState),
}));
