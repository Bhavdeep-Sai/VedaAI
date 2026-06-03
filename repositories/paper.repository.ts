import 'server-only';
import connectDB from '@/lib/db/mongodb';
import GeneratedPaper, { IGeneratedPaper, CreateGeneratedPaperDTO } from '@/models/GeneratedPaper';
import mongoose from 'mongoose';

export class PaperRepository {
  async create(data: CreateGeneratedPaperDTO): Promise<IGeneratedPaper> {
    await connectDB();
    const paper = new GeneratedPaper({
      ...data,
      generatedAt: new Date(),
    });
    return paper.save();
  }

  async findByAssignmentId(assignmentId: string): Promise<IGeneratedPaper | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) return null;
    return GeneratedPaper.findOne({ assignmentId })
      .sort({ version: -1 })
      .lean() as Promise<IGeneratedPaper | null>;
  }

  async findById(id: string): Promise<IGeneratedPaper | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return GeneratedPaper.findById(id).lean() as Promise<IGeneratedPaper | null>;
  }

  async findAllByAssignmentId(assignmentId: string): Promise<IGeneratedPaper[]> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) return [];
    return GeneratedPaper.find({ assignmentId })
      .sort({ version: -1 })
      .lean() as Promise<IGeneratedPaper[]>;
  }

  async deleteByAssignmentId(assignmentId: string): Promise<number> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) return 0;
    const result = await GeneratedPaper.deleteMany({ assignmentId });
    return result.deletedCount;
  }

  async getNextVersion(assignmentId: string): Promise<number> {
    await connectDB();
    const latest = await GeneratedPaper.findOne({ assignmentId })
      .sort({ version: -1 })
      .select('version')
      .lean();
    return latest ? (latest as { version: number }).version + 1 : 1;
  }
}

export const paperRepository = new PaperRepository();
