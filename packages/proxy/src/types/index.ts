export interface Env {
  BUDGET_KV: KVNamespace;
  USERS_KV: KVNamespace;
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  ENVIRONMENT: string;
}

export interface UserRecord {
  id: string;
  apiKeyHash: string;
  providerKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
  budgetLimitUsd: number | null;
  slackWebhookUrl?: string;
  plan: 'free' | 'pro';
  requestCount: number;
  requestCountResetAt: number;
  routingEnabled?: boolean;
  routingMode?: 'auto' | 'conservative' | 'aggressive' | 'off';
}

export interface BudgetState {
  usedUsd: number;
  blockedUntil: number | null;
  lastAlertThreshold: number;
}

export interface LoopState {
  hashes: string[];
  blocked: boolean;
  blockedAt?: number;
}
