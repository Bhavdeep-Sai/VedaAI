import { NextRequest, NextResponse } from 'next/server';
import { paperRepository } from '@/repositories/paper.repository';
import type { ApiResponse } from '@/types/api.types';
import type { IGeneratedPaper } from '@/models/GeneratedPaper';

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/papers/[id]'>,
) {
  try {
    const { id } = await ctx.params;

    // Try to find by assignment ID first, then by paper ID
    let paper = await paperRepository.findByAssignmentId(id);
    if (!paper) {
      paper = await paperRepository.findById(id);
    }

    if (!paper) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Generated paper not found' },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<IGeneratedPaper>>({
      success: true,
      data: paper as IGeneratedPaper,
    });
  } catch (error) {
    console.error('[API:papers/[id]:GET]', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Failed to fetch paper' },
      { status: 500 },
    );
  }
}
