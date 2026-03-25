export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

// Prices in USD per million tokens
export const PRICING_TABLE: Record<string, ModelPricing> = {
  // OpenAI
  'gpt-4o': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
  'gpt-4o-2024-11-20': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
  'gpt-4o-2024-08-06': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.60 },
  'gpt-4o-mini-2024-07-18': { inputPerMillion: 0.15, outputPerMillion: 0.60 },
  'gpt-4-turbo': { inputPerMillion: 10.00, outputPerMillion: 30.00 },
  'gpt-4-turbo-2024-04-09': { inputPerMillion: 10.00, outputPerMillion: 30.00 },
  'gpt-4': { inputPerMillion: 30.00, outputPerMillion: 60.00 },
  'gpt-4-0613': { inputPerMillion: 30.00, outputPerMillion: 60.00 },
  'gpt-3.5-turbo': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
  'gpt-3.5-turbo-0125': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
  'o1': { inputPerMillion: 15.00, outputPerMillion: 60.00 },
  'o1-2024-12-17': { inputPerMillion: 15.00, outputPerMillion: 60.00 },
  'o1-mini': { inputPerMillion: 3.00, outputPerMillion: 12.00 },
  'o1-mini-2024-09-12': { inputPerMillion: 3.00, outputPerMillion: 12.00 },
  'o3-mini': { inputPerMillion: 1.10, outputPerMillion: 4.40 },
  'o3-mini-2025-01-31': { inputPerMillion: 1.10, outputPerMillion: 4.40 },

  // Anthropic
  'claude-opus-4-20250514': { inputPerMillion: 15.00, outputPerMillion: 75.00 },
  'claude-sonnet-4-20250514': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-3-5-sonnet-20241022': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-3-5-sonnet-20240620': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-3-5-haiku-20241022': { inputPerMillion: 0.80, outputPerMillion: 4.00 },
  'claude-3-opus-20240229': { inputPerMillion: 15.00, outputPerMillion: 75.00 },
  'claude-3-sonnet-20240229': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-3-haiku-20240307': { inputPerMillion: 0.25, outputPerMillion: 1.25 },

  // Google
  'gemini-2.0-flash': { inputPerMillion: 0.10, outputPerMillion: 0.40 },
  'gemini-2.0-flash-lite': { inputPerMillion: 0.075, outputPerMillion: 0.30 },
  'gemini-1.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00 },
  'gemini-1.5-pro-002': { inputPerMillion: 1.25, outputPerMillion: 5.00 },
  'gemini-1.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.30 },
  'gemini-1.5-flash-002': { inputPerMillion: 0.075, outputPerMillion: 0.30 },
  'gemini-1.0-pro': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
};

// Fallback pricing for unknown models
export const FALLBACK_PRICING: ModelPricing = {
  inputPerMillion: 10.00,
  outputPerMillion: 30.00,
};

export function getModelPricing(model: string): ModelPricing {
  return PRICING_TABLE[model] ?? FALLBACK_PRICING;
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = getModelPricing(model);
  return (
    (inputTokens / 1_000_000) * pricing.inputPerMillion +
    (outputTokens / 1_000_000) * pricing.outputPerMillion
  );
}
