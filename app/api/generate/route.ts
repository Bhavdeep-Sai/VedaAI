import { NextRequest, NextResponse } from 'next/server';
import { enqueueGeneration } from '@/features/generation/generation.service';
import { z } from 'zod';
import type { ApiResponse, GenerateResponse } from '@/types/api.types';

const GenerateSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = GenerateSchema.safeParse(body);

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

    const { assignmentId } = parsed.data;
    const result = await enqueueGeneration(assignmentId);

    return NextResponse.json<ApiResponse<GenerateResponse>>(
      {
        success: true,
        data: {
          jobId: result.jobId,
          assignmentId: result.assignmentId,
          message: 'Generation job queued successfully',
        },
        message: 'Generation started',
      },
      { status: 202 }, // Accepted
    );
  } catch (error) {
    console.error('[API:generate:POST]', error);
    const message = error instanceof Error ? error.message : 'Failed to enqueue generation';
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: message },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 },
    );
  }
}
