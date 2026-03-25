import { calculateCost, getModelPricing, type TokenUsage } from '@tokenscope/shared';

export { calculateCost, getModelPricing };

export function estimateCost(model: string, usage: TokenUsage): number {
  return calculateCost(model, usage.inputTokens, usage.outputTokens);
}
