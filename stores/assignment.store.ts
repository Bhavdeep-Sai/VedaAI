'use client';

import { create } from 'zustand';
import { toast } from 'sonner';
import { apiClient } from '@/services/api.client';
import type { Assignment, AssignmentFormData } from '@/types/assignment.types';

interface AssignmentStore {
  // State
  assignments: Assignment[];
  total: number;
  currentAssignment: Assignment | null;
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: string | null; // ID being deleted
  error: string | null;
  searchQuery: string;

  // Temporary form state for multi-step wizard
  formData: Partial<AssignmentFormData>;
  currentStep: number;

  // Actions
  fetchAssignments: () => Promise<void>;
  createAssignment: (data: AssignmentFormData & { fileContent: string }) => Promise<string>;
  deleteAssignment: (id: string) => Promise<void>;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  setSearchQuery: (query: string) => void;
  setFormData: (data: Partial<AssignmentFormData>) => void;
  setStep: (step: number) => void;
  resetForm: () => void;
  clearError: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  // Initial state
  assignments: [],
  total: 0,
  currentAssignment: null,
  isLoading: false,
  isCreating: false,
  isDeleting: null,
  error: null,
  searchQuery: '',
  formData: {},
  currentStep: 1,

  // ── Actions ────────────────────────────────────────────────────────────────

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.assignments.list(get().searchQuery);
      if (Array.isArray(data)) {
        set({ assignments: data, total: data.length });
      } else {
        set({ assignments: data.items ?? [], total: data.total ?? 0 });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch assignments';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  createAssignment: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const newAssignment = await apiClient.assignments.create(data);
      set((state) => ({
        assignments: [newAssignment, ...state.assignments],
        total: state.total + 1,
      }));
      toast.success('Assignment created successfully!');
      return newAssignment._id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create assignment';
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  deleteAssignment: async (id) => {
    set({ isDeleting: id });
    try {
      await apiClient.assignments.delete(id);
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
        total: Math.max(0, state.total - 1),
      }));
      toast.success('Assignment deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete assignment';
      toast.error(message);
    } finally {
      set({ isDeleting: null });
    }
  },

  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),

  setStep: (step) => set({ currentStep: step }),

  resetForm: () => set({ formData: {}, currentStep: 1 }),

  clearError: () => set({ error: null }),
}));
