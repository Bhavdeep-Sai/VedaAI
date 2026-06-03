import { NextRequest, NextResponse } from 'next/server';
import { formatFileSize } from '@/lib/utils';
import { storageProvider } from '@/features/storage/local.provider';
import type { ApiResponse, UploadResponse } from '@/types/api.types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['pdf', 'txt'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'No file provided' },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`,
        },
        { status: 400 },
      );
    }

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Save file via storage provider
    const fileUrl = await storageProvider.saveFile(file, 'assignment');

    const response: UploadResponse = {
      fileUrl,
      fileName: file.name,
      fileType: ext as 'pdf' | 'txt',
      fileSize: file.size,
    };

    return NextResponse.json<ApiResponse<UploadResponse>>(
      { success: true, data: response },
      { status: 201 },
    );
  } catch (error) {
    console.error('[API:upload:POST]', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'File upload failed' },
      { status: 500 },
    );
  }
}
