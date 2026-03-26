import { calculateCost, getModelPricing, type TokenUsage } from '@reivo/shared';

export { calculateCost, getModelPricing };

export function estimateCost(model: string, usage: TokenUsage): number {
  return calculateCost(model, usage.inputTokens, usage.outputTokens);
}
