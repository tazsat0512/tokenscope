import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  apiKeyHash: text('api_key_hash').notNull().unique(),
  providerKeysEncrypted: text('provider_keys_encrypted').notNull().default('{}'),
  budgetLimitUsd: real('budget_limit_usd'),
  slackWebhookUrl: text('slack_webhook_url'),
  plan: text('plan').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  requestCount: integer('request_count').notNull().default(0),
  requestCountResetAt: integer('request_count_reset_at').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const requestLogs = sqliteTable('request_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  sessionId: text('session_id'),
  agentId: text('agent_id'),
  provider: text('provider').notNull(), // openai | anthropic | google
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  costUsd: real('cost_usd').notNull(),
  promptHash: text('prompt_hash').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  timestamp: integer('timestamp').notNull(),
  blocked: integer('blocked', { mode: 'boolean' }).notNull().default(false),
  blockReason: text('block_reason'),
});

export const ewmaStates = sqliteTable('ewma_states', {
  userId: text('user_id').primaryKey().references(() => users.id),
  ewmaValue: real('ewma_value').notNull().default(0),
  ewmaVariance: real('ewma_variance').notNull().default(0),
  lastUpdated: integer('last_updated').notNull(),
});

export const loopEvents = sqliteTable('loop_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  sessionId: text('session_id'),
  agentId: text('agent_id'),
  promptHash: text('prompt_hash').notNull(),
  matchCount: integer('match_count').notNull(),
  similarity: real('similarity'),
  detectedAt: integer('detected_at').notNull(),
});
