import { IStorageProvider } from './storage.provider';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { uniqueFileName } from '@/lib/utils';

export class LocalStorageProvider implements IStorageProvider {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    mkdir(this.uploadDir, { recursive: true }).catch(console.error);
  }

  async saveFile(file: File, prefix: string = ''): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = uniqueFileName(file.name);
    const fileName = prefix ? `${prefix}-${safeName}` : safeName;
    const filePath = path.join(this.uploadDir, fileName);

    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`; // Return relative URL
  }

  async getFileBuffer(fileUrl: string): Promise<Buffer> {
    // Extract filename from URL (e.g. /uploads/123-file.pdf -> 123-file.pdf)
    const fileName = fileUrl.split('/').pop() || '';
    const filePath = path.join(this.uploadDir, fileName);
    return await readFile(filePath);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('/').pop() || '';
    const filePath = path.join(this.uploadDir, fileName);
    try {
      await unlink(filePath);
    } catch (error) {
      console.warn(`[LocalStorage] Failed to delete file ${filePath}:`, error);
    }
  }
}

// Export singleton instance
export const storageProvider: IStorageProvider = new LocalStorageProvider();
