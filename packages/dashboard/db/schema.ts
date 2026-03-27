// Re-export schema from proxy package for shared types
// In production, this would use the same Drizzle schema
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  apiKeyHash: text('api_key_hash').unique(),
  providerKeysEncrypted: text('provider_keys_encrypted').notNull().default('{}'),
  budgetLimitUsd: real('budget_limit_usd'),
  slackWebhookUrl: text('slack_webhook_url'),
  plan: text('plan').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  requestCount: integer('request_count').notNull().default(0),
  requestCountResetAt: integer('request_count_reset_at').notNull().default(0),
  routingEnabled: integer('routing_enabled').notNull().default(0),
  routingMode: text('routing_mode').notNull().default('auto'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const requestLogs = sqliteTable('request_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  sessionId: text('session_id'),
  agentId: text('agent_id'),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  costUsd: real('cost_usd').notNull(),
  promptHash: text('prompt_hash').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  timestamp: integer('timestamp').notNull(),
  blocked: integer('blocked', { mode: 'boolean' }).notNull().default(false),
  blockReason: text('block_reason'),
  // Telemetry expansion fields
  cachedTokens: integer('cached_tokens'),
  hasCacheControl: integer('has_cache_control', { mode: 'boolean' }),
  maxTokensSetting: integer('max_tokens_setting'),
  isStreaming: integer('is_streaming', { mode: 'boolean' }),
  toolCount: integer('tool_count'),
  toolsUsed: text('tools_used'), // JSON array of tool names
  systemPromptHash: text('system_prompt_hash'),
  // Smart routing fields
  routedModel: text('routed_model'),
  routingReason: text('routing_reason'),
  routingSignals: text('routing_signals'), // JSON: ComplexitySignals
  // Quality verification fields
  qualityScore: real('quality_score'),
  qualityReason: text('quality_reason'),
  qualityFallback: integer('quality_fallback', { mode: 'boolean' }),
});

// Budget policies table for per-agent and global budget rules
// UNIQUE constraint on (user_id, agent_id) enforced at application layer
export const budgetPolicies = sqliteTable('budget_policies', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  agentId: text('agent_id'), // null = global policy
  limitUsd: real('limit_usd').notNull(),
  action: text('action').notNull().default('block'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const loopEvents = sqliteTable('loop_events', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  sessionId: text('session_id'),
  agentId: text('agent_id'),
  promptHash: text('prompt_hash').notNull(),
  matchCount: integer('match_count').notNull(),
  similarity: real('similarity'),
  detectedAt: integer('detected_at').notNull(),
});
