import { NextRequest, NextResponse } from 'next/server';
import { getGenerationStatus } from '@/features/generation/generation.service';
import type { ApiResponse, StatusResponse } from '@/types/api.types';

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/generation-status/[jobId]'>,
) {
  try {
    const { jobId } = await ctx.params;
    const status = await getGenerationStatus(jobId);

    if (!status) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Job not found' },
        { status: 404 },
      );
    }

    const response: StatusResponse = {
      jobId: status.jobId ?? jobId,
      assignmentId: status.assignmentId?.toString() ?? '',
      status: status.status,
      progress: status.progress ?? 0,
      message: status.message ?? '',
      paperId: status.paperId?.toString(),
      error: status.error ?? undefined,
    };

    return NextResponse.json<ApiResponse<StatusResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[API:generation-status:GET]', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Failed to fetch generation status' },
      { status: 500 },
    );
  }
}
