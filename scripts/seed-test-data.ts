import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { calculateCost, PRICING_TABLE } from '@tokenscope/shared';

// Schema inline to avoid cross-package import issues
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const users = sqliteTable('users', {
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
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

const requestLogs = sqliteTable('request_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
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
});

const loopEvents = sqliteTable('loop_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  sessionId: text('session_id'),
  agentId: text('agent_id'),
  promptHash: text('prompt_hash').notNull(),
  matchCount: integer('match_count').notNull(),
  similarity: real('similarity'),
  detectedAt: integer('detected_at').notNull(),
});

// --- Config ---
const USER_ID = 'REDACTED_USER_ID';
const USER_EMAIL = 'REDACTED_EMAIL';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client);

const models = Object.keys(PRICING_TABLE);
const agents = ['code-reviewer', 'test-writer', 'bug-fixer', 'doc-generator', null];
const sessions = Array.from({ length: 12 }, () => crypto.randomUUID());

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // 1. Create user
  const apiKeyHash = crypto.randomUUID().replace(/-/g, '');
  await db.insert(users).values({
    id: USER_ID,
    email: USER_EMAIL,
    apiKeyHash,
    plan: 'free',
    requestCount: 0,
    requestCountResetAt: Date.now(),
  }).onConflictDoNothing();

  console.log(`User created/exists: ${USER_ID}`);

  // 2. Generate 30 days of request logs
  const now = Date.now();
  const logs = [];

  for (let day = 29; day >= 0; day--) {
    const dayStart = now - day * 24 * 60 * 60 * 1000;
    const requestsPerDay = Math.floor(Math.random() * 40) + 15;

    for (let i = 0; i < requestsPerDay; i++) {
      const model = randomElement(models);
      const provider =
        model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3')
          ? 'openai'
          : model.startsWith('claude')
            ? 'anthropic'
            : 'google';
      const inputTokens = Math.floor(Math.random() * 8000) + 200;
      const outputTokens = Math.floor(Math.random() * 4000) + 100;
      const cost = calculateCost(model, inputTokens, outputTokens);
      const timestamp = dayStart + Math.floor(Math.random() * 24 * 60 * 60 * 1000);

      logs.push({
        id: crypto.randomUUID(),
        userId: USER_ID,
        sessionId: randomElement(sessions),
        agentId: randomElement(agents),
        provider,
        model,
        inputTokens,
        outputTokens,
        costUsd: cost,
        promptHash: crypto.randomUUID().replace(/-/g, ''),
        latencyMs: Math.floor(Math.random() * 3000) + 200,
        timestamp,
        blocked: false,
      });
    }
  }

  // Insert in batches of 50
  for (let i = 0; i < logs.length; i += 50) {
    const batch = logs.slice(i, i + 50);
    await db.insert(requestLogs).values(batch);
    process.stdout.write(`\rInserted ${Math.min(i + 50, logs.length)}/${logs.length} logs`);
  }
  console.log('');

  // 3. Add a few loop events
  const loopData = [];
  for (let i = 0; i < 5; i++) {
    loopData.push({
      id: crypto.randomUUID(),
      userId: USER_ID,
      sessionId: randomElement(sessions),
      agentId: randomElement(agents.filter(Boolean) as string[]),
      promptHash: crypto.randomUUID().replace(/-/g, ''),
      matchCount: Math.floor(Math.random() * 10) + 5,
      similarity: 0.92 + Math.random() * 0.08,
      detectedAt: now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  }
  await db.insert(loopEvents).values(loopData);

  console.log(`Seeded: ${logs.length} request logs, ${loopData.length} loop events`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
