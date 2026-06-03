export interface IStorageProvider {
  /**
   * Saves a file and returns its URL/path
   */
  saveFile(file: File, prefix?: string): Promise<string>;

  /**
   * Retrieves the raw buffer of a file from its URL/path
   */
  getFileBuffer(fileUrl: string): Promise<Buffer>;

  /**
   * Deletes a file by its URL/path
   */
  deleteFile(fileUrl: string): Promise<void>;
}
