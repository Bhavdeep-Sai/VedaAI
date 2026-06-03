import 'server-only';
import Groq from 'groq-sdk';
import { withRetry } from '@/lib/utils';
import { IAIProvider } from './ai-provider';

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODELS = [
  'deepseek-r1-distill-llama-70b',
  'llama-4-maverick',
  'llama3-8b-8192',
];

export class GroqProvider implements IAIProvider {
  private client: Groq;

  constructor() {
    if (!GROQ_API_KEY) {
      console.warn('[GroqProvider] GROQ_API_KEY is not configured in environment.');
    }
    this.client = new Groq({
      apiKey: GROQ_API_KEY,
    });
  }

  public async generate(prompt: string): Promise<string> {
    return this.generateWithFallback(prompt, [DEFAULT_MODEL, ...FALLBACK_MODELS]);
  }

  private async generateWithFallback(prompt: string, modelsToTry: string[]): Promise<string> {
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[GroqProvider] Attempting generation with model: ${model}`);
        // We use withRetry to handle transient network errors/rate limits on the current model
        return await withRetry(
          async () => {
            const completion = await this.client.chat.completions.create({
              model,
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert AI assistant that strictly outputs JSON. You never output markdown wrappers, reasoning text, or conversational text. You only output raw valid JSON matching the requested schema.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.1, // Highly deterministic for structural tasks
              response_format: { type: 'json_object' },
            });

            const text = completion.choices[0]?.message?.content;

            if (!text || text.trim().length === 0) {
              throw new Error('Empty response from Groq API');
            }

            return text;
          },
          3,    // retries
          1500, // delay
        );
      } catch (error) {
        console.warn(`[GroqProvider] Model ${model} failed:`, error instanceof Error ? error.message : error);
        lastError = error as Error;
        // Continue to the next fallback model
      }
    }

    // If all models failed, throw the last error
    throw new Error(`Groq AI generation failed across all models. Last error: ${lastError?.message || 'Unknown error'}`);
  }
}

// Singleton export
export const groqProvider = new GroqProvider();
