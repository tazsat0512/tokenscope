export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

// Prices in USD per million tokens
export const PRICING_TABLE: Record<string, ModelPricing> = {
  // OpenAI — GPT-4.1 series
  'gpt-4.1': { inputPerMillion: 2.0, outputPerMillion: 8.0 },
  'gpt-4.1-2025-04-14': { inputPerMillion: 2.0, outputPerMillion: 8.0 },
  'gpt-4.1-mini': { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  'gpt-4.1-mini-2025-04-14': { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  'gpt-4.1-nano': { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  'gpt-4.1-nano-2025-04-14': { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  // OpenAI — GPT-4o series
  'gpt-4o': { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  'gpt-4o-2024-11-20': { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  'gpt-4o-2024-08-06': { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'gpt-4o-mini-2024-07-18': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  // OpenAI — GPT-4 legacy
  'gpt-4-turbo': { inputPerMillion: 10.0, outputPerMillion: 30.0 },
  'gpt-4-turbo-2024-04-09': { inputPerMillion: 10.0, outputPerMillion: 30.0 },
  'gpt-4': { inputPerMillion: 30.0, outputPerMillion: 60.0 },
  'gpt-4-0613': { inputPerMillion: 30.0, outputPerMillion: 60.0 },
  'gpt-3.5-turbo': { inputPerMillion: 0.5, outputPerMillion: 1.5 },
  'gpt-3.5-turbo-0125': { inputPerMillion: 0.5, outputPerMillion: 1.5 },
  // OpenAI — o-series reasoning
  o1: { inputPerMillion: 15.0, outputPerMillion: 60.0 },
  'o1-2024-12-17': { inputPerMillion: 15.0, outputPerMillion: 60.0 },
  'o1-mini': { inputPerMillion: 3.0, outputPerMillion: 12.0 },
  'o1-mini-2024-09-12': { inputPerMillion: 3.0, outputPerMillion: 12.0 },
  o3: { inputPerMillion: 10.0, outputPerMillion: 40.0 },
  'o3-2025-04-16': { inputPerMillion: 10.0, outputPerMillion: 40.0 },
  'o3-mini': { inputPerMillion: 1.1, outputPerMillion: 4.4 },
  'o3-mini-2025-01-31': { inputPerMillion: 1.1, outputPerMillion: 4.4 },
  'o4-mini': { inputPerMillion: 1.1, outputPerMillion: 4.4 },
  'o4-mini-2025-04-16': { inputPerMillion: 1.1, outputPerMillion: 4.4 },

  // Anthropic — Claude 4.x series
  'claude-opus-4-20250514': { inputPerMillion: 15.0, outputPerMillion: 75.0 },
  'claude-sonnet-4-20250514': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  // Anthropic — Claude 4.5 series
  'claude-4-5-sonnet-20250620': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-4-5-haiku-20250620': { inputPerMillion: 0.8, outputPerMillion: 4.0 },
  // Anthropic — Claude 4.6 series
  'claude-opus-4-6-20250826': { inputPerMillion: 15.0, outputPerMillion: 75.0 },
  'claude-sonnet-4-6-20250826': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-haiku-4-5-20251001': { inputPerMillion: 0.8, outputPerMillion: 4.0 },
  // Anthropic — Claude 3.x legacy
  'claude-3-5-sonnet-20241022': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-3-5-sonnet-20240620': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-3-5-haiku-20241022': { inputPerMillion: 0.8, outputPerMillion: 4.0 },
  'claude-3-opus-20240229': { inputPerMillion: 15.0, outputPerMillion: 75.0 },
  'claude-3-sonnet-20240229': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-3-haiku-20240307': { inputPerMillion: 0.25, outputPerMillion: 1.25 },

  // Google — Gemini 2.5 series
  'gemini-2.5-pro': { inputPerMillion: 1.25, outputPerMillion: 10.0 },
  'gemini-2.5-flash': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  // Google — Gemini 2.0 series
  'gemini-2.0-flash': { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  'gemini-2.0-flash-lite': { inputPerMillion: 0.075, outputPerMillion: 0.3 },
  // Google — Gemini 1.5 series
  'gemini-1.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.0 },
  'gemini-1.5-pro-002': { inputPerMillion: 1.25, outputPerMillion: 5.0 },
  'gemini-1.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.3 },
  'gemini-1.5-flash-002': { inputPerMillion: 0.075, outputPerMillion: 0.3 },
  'gemini-1.0-pro': { inputPerMillion: 0.5, outputPerMillion: 1.5 },
};

// Fallback pricing for unknown models
export const FALLBACK_PRICING: ModelPricing = {
  inputPerMillion: 10.0,
  outputPerMillion: 30.0,
};

export function getModelPricing(model: string): ModelPricing {
  return PRICING_TABLE[model] ?? FALLBACK_PRICING;
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = getModelPricing(model);
  return (
    (inputTokens / 1_000_000) * pricing.inputPerMillion +
    (outputTokens / 1_000_000) * pricing.outputPerMillion
  );
}
