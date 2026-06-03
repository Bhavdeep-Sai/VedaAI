import 'server-only';
import { assignmentRepository } from '@/repositories/assignment.repository';
import { paperRepository } from '@/repositories/paper.repository';
import { generationStatusRepository } from '@/repositories/generation-status.repository';
import type { CreateAssignmentPayload } from '@/types/assignment.types';
import type { IAssignment } from '@/models/Assignment';

export interface AssignmentListResult {
  items: IAssignment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Create a new assignment.
 */
export async function createAssignment(
  payload: CreateAssignmentPayload & { fileContent: string },
): Promise<IAssignment> {
  return assignmentRepository.create(payload);
}

/**
 * List assignments with pagination.
 */
export async function listAssignments(
  page: number = 1,
  limit: number = 20,
): Promise<AssignmentListResult> {
  const { items, total } = await assignmentRepository.findAll(page, limit);
  return {
    items,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

/**
 * Fetch a single assignment by ID (without extracted file content).
 */
export async function getAssignment(id: string): Promise<IAssignment | null> {
  return assignmentRepository.findById(id);
}

/**
 * Fetch a single assignment with full file content for AI processing.
 */
export async function getAssignmentWithContent(id: string): Promise<IAssignment | null> {
  return assignmentRepository.findByIdWithContent(id);
}

/**
 * Delete an assignment and all associated data (papers, status records).
 */
export async function deleteAssignment(id: string): Promise<{ deleted: boolean }> {
  const [deleted] = await Promise.all([
    assignmentRepository.deleteById(id),
    paperRepository.deleteByAssignmentId(id),
    generationStatusRepository.deleteByAssignmentId(id),
  ]);
  return { deleted };
}

/**
 * Search assignments by title.
 */
export async function searchAssignments(query: string): Promise<IAssignment[]> {
  return assignmentRepository.search(query);
}
