import { NextRequest, NextResponse } from 'next/server';
import { getAssignment, deleteAssignment } from '@/features/assignments/assignment.service';
import { paperRepository } from '@/repositories/paper.repository';
import type { ApiResponse } from '@/types/api.types';

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/assignments/[id]'>,
) {
  try {
    const { id } = await ctx.params;
    const [assignment, paper] = await Promise.all([
      getAssignment(id),
      paperRepository.findByAssignmentId(id),
    ]);

    if (!assignment) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Assignment not found' },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<{ assignment: typeof assignment; paper: typeof paper }>>({
      success: true,
      data: { assignment, paper },
    });
  } catch (error) {
    console.error('[API:assignments/[id]:GET]', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Failed to fetch assignment' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<'/api/assignments/[id]'>,
) {
  try {
    const { id } = await ctx.params;
    const { deleted } = await deleteAssignment(id);

    if (!deleted) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Assignment not found' },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<{ id: string }>>({
      success: true,
      data: { id },
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('[API:assignments/[id]:DELETE]', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Failed to delete assignment' },
      { status: 500 },
    );
  }
}
