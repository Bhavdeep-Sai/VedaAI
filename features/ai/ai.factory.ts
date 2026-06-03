import { groqProvider } from './groq-provider';
import type { IAIProvider } from './ai-provider';

// This factory allows easily switching AI providers in the future
export const aiProvider: IAIProvider = groqProvider;
