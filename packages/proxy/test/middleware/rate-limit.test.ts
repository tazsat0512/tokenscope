import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { rateLimitMiddleware } from '../../src/middleware/rate-limit.js';
import type { UserRecord } from '../../src/types/index.js';

function makeUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: 'test-user',
    apiKeyHash: 'hash123',
    providerKeys: {},
    budgetLimitUsd: null,
    slackWebhookUrl: undefined,
    plan: 'free',
    requestCount: 0,
    requestCountResetAt: Date.now(),
    ...overrides,
  };
}

function createMockKV(store: Record<string, string> = {}) {
  return {
    get: async (key: string) => store[key] ?? null,
    put: async (key: string, value: string) => {
      store[key] = value;
    },
  };
}

function createApp(user: UserRecord, kvStore: Record<string, string> = {}) {
  const mockKV = createMockKV(kvStore);
  const app = new Hono();
  app.use('*', async (c, next) => {
    c.set('user' as never, user);
    c.env = { BUDGET_KV: mockKV } as never;
    await next();
  });
  app.use('*', rateLimitMiddleware);
  app.get('/test', (c) => c.json({ ok: true }));
  return { app, kvStore };
}

describe('rate-limit middleware', () => {
  it('allows request when under limit', async () => {
    const { app } = createApp(makeUser());
    const res = await app.request('/test');
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('60');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('59');
  });

  it('blocks when free plan rate limit exceeded', async () => {
    const user = makeUser();
    const windowId = Math.floor(Date.now() / 1000 / 60);
    const kvStore: Record<string, string> = {};
    kvStore[`rl:${user.id}:${windowId}`] = '60';

    const { app } = createApp(user, kvStore);
    const res = await app.request('/test');
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('rate_limit_exceeded');
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });

  it('allows pro plan higher rate limit', async () => {
    const user = makeUser({ plan: 'pro' });
    const windowId = Math.floor(Date.now() / 1000 / 60);
    const kvStore: Record<string, string> = {};
    kvStore[`rl:${user.id}:${windowId}`] = '60';

    const { app } = createApp(user, kvStore);
    const res = await app.request('/test');
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('300');
  });

  it('blocks pro plan when pro limit exceeded', async () => {
    const user = makeUser({ plan: 'pro' });
    const windowId = Math.floor(Date.now() / 1000 / 60);
    const kvStore: Record<string, string> = {};
    kvStore[`rl:${user.id}:${windowId}`] = '300';

    const { app } = createApp(user, kvStore);
    const res = await app.request('/test');
    expect(res.status).toBe(429);
  });

  it('increments counter in KV', async () => {
    const user = makeUser();
    const kvStore: Record<string, string> = {};
    const { app } = createApp(user, kvStore);

    await app.request('/test');
    const windowId = Math.floor(Date.now() / 1000 / 60);
    expect(kvStore[`rl:${user.id}:${windowId}`]).toBe('1');

    await app.request('/test');
    expect(kvStore[`rl:${user.id}:${windowId}`]).toBe('2');
  });

  it('shows correct remaining count', async () => {
    const user = makeUser();
    const windowId = Math.floor(Date.now() / 1000 / 60);
    const kvStore: Record<string, string> = {};
    kvStore[`rl:${user.id}:${windowId}`] = '55';

    const { app } = createApp(user, kvStore);
    const res = await app.request('/test');
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4');
  });
});
