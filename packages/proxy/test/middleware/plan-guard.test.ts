import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { planGuardMiddleware } from '../../src/middleware/plan-guard.js';
import type { Env, UserRecord } from '../../src/types/index.js';

type HonoEnv = { Bindings: Env; Variables: { user: UserRecord } };

function createApp(user: UserRecord) {
  const app = new Hono<HonoEnv>();
  app.use('*', async (c, next) => {
    c.set('user', user);
    await next();
  });
  app.use('*', planGuardMiddleware);
  app.get('/test', (c) => c.json({ ok: true }));
  return app;
}

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

describe('plan-guard middleware', () => {
  it('allows request when under free plan limit', async () => {
    const app = createApp(makeUser({ requestCount: 100 }));
    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('blocks when free plan limit exceeded', async () => {
    const app = createApp(makeUser({ requestCount: 10_000 }));
    const res = await app.request('/test');
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('Plan request limit exceeded');
    expect(body.plan).toBe('free');
    expect(body.request_limit).toBe(10_000);
  });

  it('allows pro plan higher limit', async () => {
    const app = createApp(makeUser({ plan: 'pro', requestCount: 50_000 }));
    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('blocks when pro plan limit exceeded', async () => {
    const app = createApp(makeUser({ plan: 'pro', requestCount: 100_000 }));
    const res = await app.request('/test');
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.plan).toBe('pro');
    expect(body.request_limit).toBe(100_000);
  });

  it('resets count when month changes', async () => {
    // Set resetAt to last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const app = createApp(
      makeUser({
        requestCount: 10_000,
        requestCountResetAt: lastMonth.getTime(),
      }),
    );
    const res = await app.request('/test');
    expect(res.status).toBe(200); // Count reset to 0, so allowed
  });

  it('defaults to free plan when plan is missing', async () => {
    const user = makeUser({ requestCount: 10_000 });
    // @ts-expect-error testing missing plan field
    user.plan = undefined;
    const app = createApp(user);
    const res = await app.request('/test');
    expect(res.status).toBe(429);
  });
});
