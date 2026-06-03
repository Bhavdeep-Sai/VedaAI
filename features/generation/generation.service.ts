import 'server-only';
import { assignmentRepository } from '@/repositories/assignment.repository';
import { paperRepository } from '@/repositories/paper.repository';
import { generationStatusRepository } from '@/repositories/generation-status.repository';
import { getRedisClient } from '@/lib/redis/redis.client';
import { getGenerationQueue } from '@/queues/generation.queue';
import type { IAssignment } from '@/models/Assignment';
import type { GeneratedPaper } from '@/types/paper.types';
import mongoose from 'mongoose';

export interface EnqueueResult {
  jobId: string;
  assignmentId: string;
}

/**
 * Enqueue an AI generation job for an assignment.
 */
export async function enqueueGeneration(assignmentId: string): Promise<EnqueueResult> {
  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment not found: ${assignmentId}`);
  }

  if (['queued', 'processing'].includes(assignment.status)) {
    throw new Error('Generation is already in progress for this assignment');
  }

  // ── Clear stale cached status from previous generation ──────────────────
  // This prevents the SSE route from immediately replaying the old
  // 'generation-completed' event to a new connection (causes instant skip).
  const redis = getRedisClient();
  await redis.del(`gen:status:${assignmentId}`);

  const queue = getGenerationQueue();
  const job = await queue.add(
    'generate-paper',
    { assignmentId },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 100 },
    },
  );

  // Create status record in DB
  await generationStatusRepository.create({
    assignmentId,
    jobId: job.id!,
  });

  // Update assignment status
  await assignmentRepository.updateStatus(assignmentId, 'queued');

  return { jobId: job.id!, assignmentId };
}

/**
 * Fetch current generation status from Redis cache first, then DB.
 */
export async function getGenerationStatus(jobId: string) {
  const redis = getRedisClient();
  const cached = await redis.get(`gen:status:${jobId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  return generationStatusRepository.findByJobId(jobId);
}

/**
 * Publish a progress update event to Redis pub/sub.
 * Workers call this to notify SSE clients.
 */
export async function publishProgress(
  assignmentId: string,
  event: {
    type: string;
    progress: number;
    message: string;
    paperId?: string;
    error?: string;
  },
): Promise<void> {
  const redis = getRedisClient();
  const channel = `gen:progress:${assignmentId}`;
  await redis.publish(channel, JSON.stringify(event));

  // Also cache latest status
  if (event.type === 'generation-completed' || event.type === 'generation-failed') {
    await redis.setex(
      `gen:status:${assignmentId}`,
      3600, // 1 hour TTL
      JSON.stringify(event),
    );
  }
}

/**
 * Save a generated paper to the database and update assignment status.
 */
export async function saveGeneratedPaper(
  assignment: IAssignment,
  paper: GeneratedPaper,
  jobId: string,
): Promise<string> {
  const version = await paperRepository.getNextVersion(assignment._id.toString());

  const saved = await paperRepository.create({
    assignmentId: new mongoose.Types.ObjectId(assignment._id.toString()) as unknown as mongoose.Types.ObjectId,
    metadata: paper.metadata,
    sections: paper.sections.map((s) => ({
      ...s,
      questions: s.questions.map((q) => ({
        ...q,
        subParts: q.subParts ?? [],
      })),
    })),
    totalQuestions: paper.totalQuestions,
    totalMarks: paper.totalMarks,
    version,
  });

  const paperId = saved._id.toString();

  // Update assignment status
  await assignmentRepository.updateStatus(assignment._id.toString(), 'completed');

  // Update generation status record
  await generationStatusRepository.updateStatus(jobId, {
    status: 'completed',
    progress: 100,
    message: 'Question paper ready!',
    paperId: new mongoose.Types.ObjectId(paperId) as unknown as mongoose.Types.ObjectId,
    completedAt: new Date(),
  });

  return paperId;
}
