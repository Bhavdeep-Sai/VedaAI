import { NextRequest, NextResponse } from 'next/server';
import { listAssignments } from '@/features/assignments/assignment.service';
import { assignmentRepository } from '@/repositories/assignment.repository';
import { z } from 'zod';
import type { ApiResponse } from '@/types/api.types';
import type { IAssignment } from '@/models/Assignment';

const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  dueDate: z.string().min(1, 'Due date is required'),
  fileUrl: z.string().default(''),
  fileName: z.string().default(''),
  fileType: z.union([z.enum(['pdf', 'txt']), z.literal('')]).default(''),
  fileSize: z.number().default(0),
  fileContent: z.string().default(''),
  questionTypes: z
    .array(
      z.object({
        type: z.string().min(1),
        count: z.number().int().min(1).max(100),
        marksPerQuestion: z.number().int().min(1).max(100),
      }),
    )
    .min(1, 'At least one question type is required'),
  additionalInstructions: z.string().max(2000).default(''),
  schoolName: z.string().default(''),
  className: z.string().default(''),
  subject: z.string().default(''),
  timeAllowed: z.string().default(''),
  headerLayout: z.enum(['layout-1', 'layout-2', 'layout-3']).default('layout-1'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const query = searchParams.get('q');

    if (query && query.trim().length > 0) {
      const items = await assignmentRepository.search(query);
      return NextResponse.json<ApiResponse<typeof items>>({
        success: true,
        data: items,
      });
    }

    const result = await listAssignments(page, limit);
    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API:assignments:GET]', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateAssignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
        { status: 400 },
      );
    }

    const { createAssignment } = await import('@/features/assignments/assignment.service');
    const assignment = await createAssignment(parsed.data);

    return NextResponse.json<ApiResponse<IAssignment>>(
      { success: true, data: assignment as IAssignment, message: 'Assignment created successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[API:assignments:POST]', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 },
    );
  }
}
