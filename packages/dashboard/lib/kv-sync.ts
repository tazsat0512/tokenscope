import { decrypt } from './encryption';

interface UserRecord {
  id: string;
  apiKeyHash: string;
  providerKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
  budgetLimitUsd: number | null;
  slackWebhookUrl?: string;
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

export async function syncUserToKV(user: {
  id: string;
  apiKeyHash: string | null;
  providerKeysEncrypted: string;
  budgetLimitUsd: number | null;
  slackWebhookUrl: string | null;
}): Promise<void> {
  if (!user.apiKeyHash) return;

  let providerKeys: UserRecord['providerKeys'] = {};
  try {
    if (user.providerKeysEncrypted && user.providerKeysEncrypted !== '{}') {
      const decrypted = await decrypt(user.providerKeysEncrypted);
      providerKeys = JSON.parse(decrypted);
    }
  } catch {
    // If decryption fails (e.g. unencrypted legacy data), try parsing directly
    try {
      providerKeys = JSON.parse(user.providerKeysEncrypted);
    } catch {
      providerKeys = {};
    }
  }

  const record: UserRecord = {
    id: user.id,
    apiKeyHash: user.apiKeyHash,
    providerKeys,
    budgetLimitUsd: user.budgetLimitUsd,
    slackWebhookUrl: user.slackWebhookUrl ?? undefined,
  };

  await kvPut(`key:${user.apiKeyHash}`, JSON.stringify(record));
}

export async function deleteOldKVEntry(oldApiKeyHash: string): Promise<void> {
  await kvDelete(`key:${oldApiKeyHash}`);
}
