import 'server-only';
import connectDB from '@/lib/db/mongodb';
import Assignment, { IAssignment } from '@/models/Assignment';
import type { CreateAssignmentPayload } from '@/types/assignment.types';
import mongoose from 'mongoose';

export class AssignmentRepository {
  async create(payload: CreateAssignmentPayload & { fileContent: string }): Promise<IAssignment> {
    await connectDB();
    const assignment = new Assignment({
      ...payload,
      dueDate: new Date(payload.dueDate),
      status: 'draft',
    });
    return assignment.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: IAssignment[]; total: number }> {
    await connectDB();
    const [items, total] = await Promise.all([
      Assignment.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-fileContent') // exclude large field from list view
        .lean(),
      Assignment.countDocuments({}),
    ]);
    return { items: items as IAssignment[], total };
  }

  async findById(id: string): Promise<IAssignment | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Assignment.findById(id).lean() as Promise<IAssignment | null>;
  }

  async findByIdWithContent(id: string): Promise<IAssignment | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Assignment.findById(id).lean() as Promise<IAssignment | null>;
  }

  async updateStatus(
    id: string,
    status: IAssignment['status'],
  ): Promise<IAssignment | null> {
    await connectDB();
    return Assignment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).lean() as Promise<IAssignment | null>;
  }

  async deleteById(id: string): Promise<boolean> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Assignment.findByIdAndDelete(id);
    return result !== null;
  }

  async search(query: string): Promise<IAssignment[]> {
    await connectDB();
    return Assignment.find({
      title: { $regex: query, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-fileContent')
      .lean() as Promise<IAssignment[]>;
  }
}

export const assignmentRepository = new AssignmentRepository();
