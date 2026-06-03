'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGenerationStore } from '@/stores/generation.store';
import type { SSEEvent } from '@/types/paper.types';

interface UseGenerationSSEOptions {
  onCompleted?: (paperId: string) => void;
  onFailed?: (error: string) => void;
}

/**
 * Subscribes to the SSE stream for a generation job.
 * Automatically manages connection lifecycle and reconnection.
 */
export function useGenerationSSE(
  assignmentId: string | null,
  options: UseGenerationSSEOptions = {},
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { updateFromSSE, setConnected } = useGenerationStore();
  
  // Use refs for callbacks to avoid re-triggering effect when they change
  const callbacksRef = useRef(options);
  useEffect(() => {
    callbacksRef.current = options;
  });

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnected(false);
    }
  }, [setConnected]);

  useEffect(() => {
    if (!assignmentId) return;

    // Close any existing connection
    disconnect();

    const url = `/api/events/${assignmentId}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
      console.log('[SSE] Connected to generation stream');
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent & { type: string; paperId?: string; error?: string } = JSON.parse(
          event.data,
        );

        if ((data.type as string) === 'connected') return; // Ignore heartbeat

        updateFromSSE(data as SSEEvent);

        if (data.type === 'generation-completed') {
          callbacksRef.current.onCompleted?.(data.paperId ?? '');
          // Close connection after completion
          disconnect();
        } else if (data.type === 'generation-failed') {
          callbacksRef.current.onFailed?.(data.error ?? data.message ?? 'Unknown error');
          disconnect();
        }
      } catch (err) {
        console.warn('[SSE] Failed to parse message:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
      setConnected(false);
      // EventSource will auto-reconnect unless we close it
    };

    return () => {
      disconnect();
    };
  }, [assignmentId, updateFromSSE, setConnected, disconnect]);

  return { disconnect };
}
