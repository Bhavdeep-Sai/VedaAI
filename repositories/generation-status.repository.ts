import 'server-only';
import connectDB from '@/lib/db/mongodb';
import GenerationStatus, { IGenerationStatus } from '@/models/GenerationStatus';
import mongoose from 'mongoose';

export class GenerationStatusRepository {
  async create(data: {
    assignmentId: string;
    jobId: string;
  }): Promise<IGenerationStatus> {
    await connectDB();
    const status = new GenerationStatus({
      assignmentId: new mongoose.Types.ObjectId(data.assignmentId),
      jobId: data.jobId,
      status: 'queued',
      progress: 0,
      message: 'Queued for processing...',
    });
    return status.save();
  }

  async findByJobId(jobId: string): Promise<IGenerationStatus | null> {
    await connectDB();
    return GenerationStatus.findOne({ jobId }).lean() as Promise<IGenerationStatus | null>;
  }

  async findByAssignmentId(assignmentId: string): Promise<IGenerationStatus | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) return null;
    return GenerationStatus.findOne({ assignmentId })
      .sort({ createdAt: -1 })
      .lean() as Promise<IGenerationStatus | null>;
  }

  async updateStatus(
    jobId: string,
    updates: Partial<Pick<IGenerationStatus, 'status' | 'progress' | 'message' | 'error' | 'paperId' | 'startedAt' | 'completedAt'>>,
  ): Promise<IGenerationStatus | null> {
    await connectDB();
    return GenerationStatus.findOneAndUpdate(
      { jobId },
      { $set: updates },
      { new: true },
    ).lean() as Promise<IGenerationStatus | null>;
  }

  async deleteByAssignmentId(assignmentId: string): Promise<void> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) return;
    await GenerationStatus.deleteMany({ assignmentId });
  }
}

export const generationStatusRepository = new GenerationStatusRepository();
