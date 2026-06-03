import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { uniqueFileName, formatFileSize } from '@/lib/utils';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
import type { ApiResponse, UploadResponse } from '@/types/api.types';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'text/plain'];
const ALLOWED_EXTENSIONS = ['pdf', 'txt'];

export async function POST(request: NextRequest) {
  try {
    // Ensure uploads directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

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

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file to disk
    const savedFileName = uniqueFileName(file.name);
    const filePath = join(UPLOAD_DIR, savedFileName);
    await writeFile(filePath, buffer);

    // Extract text content
    let extractedText = '';
    let wordCount = 0;

    if (ext === 'pdf') {
      try {
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text ?? '';
        wordCount = extractedText.split(/\s+/).filter(Boolean).length;
      } catch (pdfError) {
        console.warn('[Upload] PDF parsing failed:', pdfError);
        extractedText = '';
      }
    } else if (ext === 'txt') {
      extractedText = buffer.toString('utf-8');
      wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    }

    const fileUrl = `/uploads/${savedFileName}`;
    const response: UploadResponse = {
      fileUrl,
      fileName: file.name,
      fileType: ext as 'pdf' | 'txt',
      fileSize: file.size,
      extractedText,
      wordCount,
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
