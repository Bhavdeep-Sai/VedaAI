import 'server-only';

export interface AIProviderResponse {
  success: boolean;
  text: string;
  error?: string;
}

export interface IAIProvider {
  /**
   * Generates content from the AI provider based on a specific prompt.
   *
   * @param prompt The complete, finalized instruction block.
   * @returns A string containing the AI's response (expected to be JSON stringified).
   */
  generate(prompt: string): Promise<string>;
}
