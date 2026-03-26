export type BudgetAction = 'block' | 'alert' | 'downgrade';

export interface BudgetPolicy {
  agentId: string | null; // null = global
  limitUsd: number;
  action: BudgetAction;
}

export interface Env {
  BUDGET_KV: KVNamespace;
  USERS_KV: KVNamespace;
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  ENCRYPTION_KEY: string;
  ENVIRONMENT: string;
}

export interface ProviderKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
}

export interface UserRecord {
  id: string;
  apiKeyHash: string;
  providerKeysEncrypted: string;
  /** Populated at runtime after decryption — never stored */
  providerKeys?: ProviderKeys;
  budgetLimitUsd: number | null;
  slackWebhookUrl?: string;
  plan: 'free' | 'pro';
  requestCount: number;
  requestCountResetAt: number;
  budgetAction: BudgetAction;
  agentBudgets?: BudgetPolicy[];
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
