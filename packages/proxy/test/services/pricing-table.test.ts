import { FALLBACK_PRICING, getModelPricing, PRICING_TABLE } from '@tokenscope/shared';
import { describe, expect, it } from 'vitest';

describe('pricing-table', () => {
  it('has pricing for all major OpenAI models', () => {
    const openaiModels = [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'o1',
      'o1-mini',
      'o3-mini',
    ];
    for (const model of openaiModels) {
      expect(PRICING_TABLE[model], `Missing pricing for ${model}`).toBeDefined();
    }
  });

  it('has pricing for all major Anthropic models', () => {
    const anthropicModels = [
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
    ];
    for (const model of anthropicModels) {
      expect(PRICING_TABLE[model], `Missing pricing for ${model}`).toBeDefined();
    }
  });

  it('has pricing for all major Google models', () => {
    const googleModels = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    for (const model of googleModels) {
      expect(PRICING_TABLE[model], `Missing pricing for ${model}`).toBeDefined();
    }
  });

  it('returns fallback for unknown model', () => {
    expect(getModelPricing('nonexistent-model')).toEqual(FALLBACK_PRICING);
  });

  it('all prices are positive', () => {
    for (const [model, pricing] of Object.entries(PRICING_TABLE)) {
      expect(pricing.inputPerMillion, `${model} input`).toBeGreaterThan(0);
      expect(pricing.outputPerMillion, `${model} output`).toBeGreaterThan(0);
    }
  });

  it('output is always >= input price', () => {
    for (const [model, pricing] of Object.entries(PRICING_TABLE)) {
      expect(pricing.outputPerMillion, `${model}`).toBeGreaterThanOrEqual(pricing.inputPerMillion);
    }
  });
});
