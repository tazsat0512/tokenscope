import {
  calculateCost,
  FALLBACK_PRICING,
  getModelPricing,
  PRICING_TABLE,
} from '@reivo/shared';
import { describe, expect, it } from 'vitest';

describe('cost-calculator', () => {
  it('calculates gpt-4o cost correctly', () => {
    // gpt-4o: $2.50/M input, $10.00/M output
    const cost = calculateCost('gpt-4o', 1000, 500);
    expect(cost).toBeCloseTo(0.0025 + 0.005, 6); // 0.0075
  });

  it('calculates gpt-4o-mini cost correctly', () => {
    // gpt-4o-mini: $0.15/M input, $0.60/M output
    const cost = calculateCost('gpt-4o-mini', 10000, 5000);
    expect(cost).toBeCloseTo(0.0015 + 0.003, 6); // 0.0045
  });

  it('calculates claude-3-5-sonnet cost correctly', () => {
    const cost = calculateCost('claude-3-5-sonnet-20241022', 2000, 1000);
    // $3.00/M input, $15.00/M output
    expect(cost).toBeCloseTo(0.006 + 0.015, 6); // 0.021
  });

  it('calculates gemini-2.0-flash cost correctly', () => {
    const cost = calculateCost('gemini-2.0-flash', 5000, 2000);
    // $0.10/M input, $0.40/M output
    expect(cost).toBeCloseTo(0.0005 + 0.0008, 6); // 0.0013
  });

  it('uses fallback pricing for unknown models', () => {
    const pricing = getModelPricing('unknown-model-xyz');
    expect(pricing).toEqual(FALLBACK_PRICING);
  });

  it('calculates zero cost for zero tokens', () => {
    expect(calculateCost('gpt-4o', 0, 0)).toBe(0);
  });

  it('handles large token counts', () => {
    const cost = calculateCost('gpt-4o', 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(2.5 + 10.0, 2);
  });

  it('has valid pricing for all models in table', () => {
    for (const [model, pricing] of Object.entries(PRICING_TABLE)) {
      expect(pricing.inputPerMillion, `${model} input`).toBeGreaterThan(0);
      expect(pricing.outputPerMillion, `${model} output`).toBeGreaterThan(0);
    }
  });

  it('has at least 30 models in pricing table', () => {
    expect(Object.keys(PRICING_TABLE).length).toBeGreaterThanOrEqual(30);
  });
});
