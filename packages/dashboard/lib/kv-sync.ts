import { decrypt, encrypt } from './encryption';

type BudgetAction = 'block' | 'alert' | 'downgrade';

interface BudgetPolicy {
  agentId: string | null;
  limitUsd: number;
  action: BudgetAction;
}

interface UserRecord {
  id: string;
  apiKeyHash: string;
  providerKeysEncrypted: string;
  budgetLimitUsd: number | null;
  budgetAction: BudgetAction;
  agentBudgets?: BudgetPolicy[];
  slackWebhookUrl?: string;
  plan: 'free' | 'pro';
  requestCount: number;
  requestCountResetAt: number;
  routingEnabled?: boolean;
  routingMode?: 'auto' | 'conservative' | 'aggressive' | 'off';
}

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

async function kvPut(key: string, value: string): Promise<void> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const namespaceId = process.env.CF_KV_NAMESPACE_ID;
  const apiToken = process.env.CF_API_TOKEN;

  if (!accountId || !namespaceId || !apiToken) {
    console.warn('KV sync skipped: missing CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, or CF_API_TOKEN');
    return;
  }

  const url = `${CF_API_BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'text/plain',
    },
    body: value,
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`KV sync failed: ${res.status} ${body}`);
  }
}

async function kvDelete(key: string): Promise<void> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const namespaceId = process.env.CF_KV_NAMESPACE_ID;
  const apiToken = process.env.CF_API_TOKEN;

  if (!accountId || !namespaceId || !apiToken) return;

  const url = `${CF_API_BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
  await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiToken}` },
  });
}

export async function syncUserToKV(
  user: {
    id: string;
    apiKeyHash: string | null;
    providerKeysEncrypted: string;
    budgetLimitUsd: number | null;
    slackWebhookUrl: string | null;
    plan?: string;
    requestCount?: number;
    requestCountResetAt?: number;
    routingEnabled?: number | boolean;
    routingMode?: string;
  },
  agentBudgets?: BudgetPolicy[],
): Promise<void> {
  if (!user.apiKeyHash) return;

  // Extract default keys from encrypted storage, then re-encrypt as flat map for proxy
  let encryptedForKV = '{}';
  try {
    if (user.providerKeysEncrypted && user.providerKeysEncrypted !== '{}') {
      const parsed = JSON.parse(await decrypt(user.providerKeysEncrypted));
      const flat: Record<string, string> = {};
      for (const provider of ['openai', 'anthropic', 'google'] as const) {
        const val = parsed[provider];
        if (typeof val === 'string') {
          flat[provider] = val;
        } else if (Array.isArray(val)) {
          const def = val.find((k: Record<string, unknown>) => k.isDefault);
          const first = val[0] as Record<string, unknown> | undefined;
          const entry = def ?? first;
          if (entry && typeof entry.key === 'string') {
            flat[provider] = entry.key;
          }
        }
      }
      encryptedForKV = await encrypt(JSON.stringify(flat));
    }
  } catch {
    encryptedForKV = '{}';
  }

  const record: UserRecord = {
    id: user.id,
    apiKeyHash: user.apiKeyHash,
    providerKeysEncrypted: encryptedForKV,
    budgetLimitUsd: user.budgetLimitUsd,
    budgetAction: 'block',
    agentBudgets: agentBudgets ?? undefined,
    slackWebhookUrl: user.slackWebhookUrl ?? undefined,
    plan: (user.plan as 'free' | 'pro') ?? 'free',
    requestCount: user.requestCount ?? 0,
    requestCountResetAt: user.requestCountResetAt ?? 0,
    routingEnabled: user.routingEnabled ? true : false,
    routingMode: (user.routingMode as UserRecord['routingMode']) ?? 'auto',
  };

  await kvPut(`key:${user.apiKeyHash}`, JSON.stringify(record));
}

export async function deleteOldKVEntry(oldApiKeyHash: string): Promise<void> {
  await kvDelete(`key:${oldApiKeyHash}`);
}
