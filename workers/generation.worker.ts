import { Worker, Job } from 'bullmq';
import { QUEUE_NAME } from '@/queues/generation.queue';
import { createFreshRedisConnection } from '@/lib/redis/redis.client';

interface GenerationJobData {
  assignmentId: string;
}

let worker: Worker | null = null;

async function processGenerationJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId } = job.data;
  console.log(`[Worker] Processing job ${job.id} for assignment ${assignmentId}`);

  const { getAssignmentWithContent } = await import('@/features/assignments/assignment.service');
  const { buildQuestionPaperPrompt } = await import('@/features/generation/prompt.builder');
  const { groqProvider } = await import('@/features/ai/groq-provider');
  const { parseAIResponse } = await import('@/features/ai/response.parser');
  const { publishProgress, saveGeneratedPaper } = await import(
    '@/features/generation/generation.service'
  );
  const { assignmentRepository } = await import('@/repositories/assignment.repository');
  const { generationStatusRepository } = await import(
    '@/repositories/generation-status.repository'
  );

  // ── Stage 1: Fetch assignment ──────────────────────────────────────────────
  await job.updateProgress(10);
  await publishProgress(assignmentId, {
    type: 'generation-started',
    progress: 10,
    message: 'Fetching assignment details...',
  });
  await generationStatusRepository.updateStatus(job.id!, {
    status: 'processing',
    progress: 10,
    message: 'Fetching assignment details...',
    startedAt: new Date(),
  });

  const assignment = await getAssignmentWithContent(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment not found: ${assignmentId}`);
  }

  await assignmentRepository.updateStatus(assignmentId, 'processing');

  // ── Stage 2: Build prompt ──────────────────────────────────────────────────
  await job.updateProgress(25);
  await publishProgress(assignmentId, {
    type: 'generation-progress',
    progress: 25,
    message: 'Analyzing document content...',
  });
  await generationStatusRepository.updateStatus(job.id!, {
    progress: 25,
    message: 'Analyzing document content...',
  });

  const prompt = buildQuestionPaperPrompt(assignment, assignment.fileContent ?? '');

  // ── Stage 3: AI generation ─────────────────────────────────────────────────
  await job.updateProgress(45);
  await publishProgress(assignmentId, {
    type: 'generation-progress',
    progress: 45,
    message: 'Generating questions with AI...',
  });
  await generationStatusRepository.updateStatus(job.id!, {
    progress: 45,
    message: 'Generating questions with AI...',
  });

  const rawAIResponse = await groqProvider.generate(prompt);

  // ── Stage 4: Parse & validate ──────────────────────────────────────────────
  await job.updateProgress(75);
  await publishProgress(assignmentId, {
    type: 'generation-progress',
    progress: 75,
    message: 'Validating and structuring paper...',
  });
  await generationStatusRepository.updateStatus(job.id!, {
    progress: 75,
    message: 'Validating and structuring paper...',
  });

  const parsedPaper = parseAIResponse(rawAIResponse, assignmentId);

  // ── Stage 5: Save to database ──────────────────────────────────────────────
  await job.updateProgress(90);
  await publishProgress(assignmentId, {
    type: 'generation-progress',
    progress: 90,
    message: 'Saving question paper...',
  });

  const paperId = await saveGeneratedPaper(assignment, parsedPaper, job.id!);

  // ── Stage 6: Complete ──────────────────────────────────────────────────────
  await job.updateProgress(100);
  await publishProgress(assignmentId, {
    type: 'generation-completed',
    progress: 100,
    message: 'Question paper ready!',
    paperId,
  });

  console.log(`[Worker] Job ${job.id} completed. Paper ID: ${paperId}`);
}

async function handleJobFailure(
  job: Job<GenerationJobData> | undefined,
  error: Error,
): Promise<void> {
  if (!job) return;
  const { assignmentId } = job.data;
  console.error(`[Worker] Job ${job.id} failed:`, error);

  try {
    const { publishProgress } = await import('@/features/generation/generation.service');
    const { assignmentRepository } = await import('@/repositories/assignment.repository');
    const { generationStatusRepository } = await import(
      '@/repositories/generation-status.repository'
    );

    await Promise.all([
      publishProgress(assignmentId, {
        type: 'generation-failed',
        progress: 0,
        message: 'Generation failed. Please try again.',
        error: error.message,
      }),
      assignmentRepository.updateStatus(assignmentId, 'failed'),
      generationStatusRepository.updateStatus(job.id!, {
        status: 'failed',
        progress: 0,
        message: 'Generation failed',
        error: error.message,
        completedAt: new Date(),
      }),
    ]);
  } catch (cleanupError) {
    console.error('[Worker] Failed to handle job failure cleanup:', cleanupError);
  }
}

export function startWorker(): Worker {
  if (worker) {
    console.log('[Worker] Already running');
    return worker;
  }

  worker = new Worker<GenerationJobData>(QUEUE_NAME, processGenerationJob, {
    connection: createFreshRedisConnection(),
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60000,
    },
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', async (job, error) => {
    await handleJobFailure(job, error);
  });

  worker.on('error', (error: any) => {
    if (
      error.code === 'ECONNREFUSED' ||
      error.message.includes('ECONNREFUSED') ||
      (error.errors && error.errors.some((e: any) => e.code === 'ECONNREFUSED'))
    ) {
      return; // Suppress massive connection retry spam if Redis is not running
    }
    console.error('[Worker] Worker error:', error);
  });

  worker.on('active', (job) => {
    console.log(`[Worker] Job ${job.id} started`);
  });

  console.log('[Worker] Generation worker started');

  process.on('SIGTERM', async () => {
    await worker?.close();
  });

  process.on('SIGINT', async () => {
    await worker?.close();
    process.exit(0);
  });

  return worker;
}

export function stopWorker(): Promise<void> | undefined {
  return worker?.close();
}
