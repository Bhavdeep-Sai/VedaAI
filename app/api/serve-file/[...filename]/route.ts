import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/serve-file/[...filename]'>,
) {
  try {
    const { filename } = await ctx.params;
    const filePath = join(process.cwd(), 'uploads', ...filename);

    const fileBuffer = await readFile(filePath);
    const ext = filename[filename.length - 1].split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      txt: 'text/plain',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
    };

    const contentType = mimeTypes[ext ?? ''] ?? 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}
