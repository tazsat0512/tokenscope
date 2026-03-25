export interface ProxyUser {
  id: string;
  apiKeyHash: string;
  providerKeys: { openai?: string; anthropic?: string; google?: string };
  budgetLimitUsd: number | null;
  budgetUsedUsd: number;
  blockedUntil: number | null;
  slackWebhookUrl?: string;
}

export interface RequestLog {
  id: string;
  userId: string;
  sessionId: string | null;
  agentId: string | null;
  provider: ProviderName;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  promptHash: string;
  latencyMs: number;
  timestamp: number;
  blocked: boolean;
  blockReason?: string;
}

export type ProviderName = 'openai' | 'anthropic' | 'google';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface Provider {
  name: ProviderName;
  extractModel(body: unknown): string;
  extractUsage(body: unknown): TokenUsage;
  buildUpstreamUrl(path: string): string;
  buildHeaders(providerKey: string, originalHeaders: Headers): Headers;
  parseStreamChunk(chunk: string): {
    done: boolean;
    usage?: TokenUsage;
  };
}

export interface BudgetStatus {
  limitUsd: number | null;
  usedUsd: number;
  remainingUsd: number | null;
  blocked: boolean;
}

export interface LoopDetectionResult {
  isLoop: boolean;
  matchCount: number;
  similarity?: number;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  zScore: number;
  ewmaValue: number;
  currentRate: number;
}

export type AlertType = 'budget_warning' | 'budget_exceeded' | 'loop_detected' | 'anomaly_detected';

export interface AlertPayload {
  type: AlertType;
  userId: string;
  message: string;
  details: Record<string, unknown>;
  timestamp: number;
}
