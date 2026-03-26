export const API_KEY_PREFIX = 'rv_';
export const HEADER_SESSION_ID = 'x-session-id';
export const HEADER_AGENT_ID = 'x-agent-id';
export const HEADER_BUDGET_USED = 'x-reivo-budget-used';
export const HEADER_BUDGET_REMAINING = 'x-reivo-budget-remaining';
export const HEADER_BUDGET_LIMIT = 'x-reivo-budget-limit';
export const HEADER_BUDGET_ACTION = 'x-reivo-budget-action';
export const HEADER_REQUEST_ID = 'x-reivo-request-id';

export const LOOP_HASH_WINDOW = 20;
export const LOOP_HASH_THRESHOLD = 5;
export const LOOP_COSINE_THRESHOLD = 0.92;

export const EWMA_ALPHA = 0.3;
export const ANOMALY_Z_THRESHOLD = 3.0;

export const BUDGET_ALERT_THRESHOLDS = [0.5, 0.8, 1.0] as const;

export const PROVIDER_URLS = {
  openai: 'https://api.openai.com',
  anthropic: 'https://api.anthropic.com',
  google: 'https://generativelanguage.googleapis.com',
} as const;

export const FREE_PLAN_REQUEST_LIMIT = 10_000;
export const PRO_PLAN_REQUEST_LIMIT = 100_000;
export const PRO_PLAN_PRICE_USD = 49;
