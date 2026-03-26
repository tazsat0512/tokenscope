import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createHash } from 'node:crypto';

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
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

const USER_ID = 'REDACTED_USER_ID';
const ANTHROPIC_KEY = 'REDACTED_ANTHROPIC_KEY';

// Generate a TokenScope API key
const TS_API_KEY = `ts_${crypto.randomUUID().replace(/-/g, '')}`;

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client);

async function main() {
  const apiKeyHash = sha256(TS_API_KEY);

  // Update user with API key hash and provider keys
  await db
    .update(users)
    .set({
      apiKeyHash,
      providerKeysEncrypted: JSON.stringify({ anthropic: ANTHROPIC_KEY }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, USER_ID));

  // Output the KV user record (to be written to USERS_KV)
  const kvRecord = {
    id: USER_ID,
    apiKeyHash,
    providerKeys: { anthropic: ANTHROPIC_KEY },
    budgetLimitUsd: null,
    slackWebhookUrl: undefined,
  };

  console.log('\n=== TokenScope API Key (save this!) ===');
  console.log(TS_API_KEY);
  console.log('\n=== API Key Hash ===');
  console.log(apiKeyHash);
  console.log('\n=== KV Record (for USERS_KV) ===');
  console.log(JSON.stringify(kvRecord));

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
