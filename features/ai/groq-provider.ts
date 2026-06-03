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

// Models known to support response_format: json_object
const JSON_MODE_SUPPORTED_MODELS = new Set([
  'openai/gpt-oss-120b',
  'llama3-8b-8192',
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
]);

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

  private async callModel(model: string, prompt: string, useJsonMode: boolean): Promise<string> {
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
      temperature: 0.1,
      ...(useJsonMode ? { response_format: { type: 'json_object' } } : {}),
    });

    const text = completion.choices[0]?.message?.content;
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Groq API');
    }
    return text;
  }

  private async generateWithModel(model: string, prompt: string): Promise<string> {
    const supportsJsonMode = JSON_MODE_SUPPORTED_MODELS.has(model);

    return withRetry(
      async () => {
        if (supportsJsonMode) {
          try {
            return await this.callModel(model, prompt, true);
          } catch (jsonModeErr) {
            const msg = jsonModeErr instanceof Error ? jsonModeErr.message : String(jsonModeErr);
            // If json_object mode is explicitly rejected by the API, fall back without it
            if (msg.includes('response_format') || msg.includes('json_object') || msg.includes('400')) {
              console.warn(`[GroqProvider] Model ${model} rejected json_object mode, retrying without it`);
              return await this.callModel(model, prompt, false);
            }
            throw jsonModeErr;
          }
        }

        // Non-json-mode models: call without response_format
        return await this.callModel(model, prompt, false);
      },
      3,    // retries
      1500, // delay
    );
  }

  private async generateWithFallback(prompt: string, modelsToTry: string[]): Promise<string> {
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[GroqProvider] Attempting generation with model: ${model}`);
        const result = await this.generateWithModel(model, prompt);
        console.log(`[GroqProvider] Model ${model} succeeded (${result.length} chars)`);
        return result;
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
