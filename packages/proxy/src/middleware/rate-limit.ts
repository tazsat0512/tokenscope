import {
  RATE_LIMIT_FREE_PER_MINUTE,
  RATE_LIMIT_PRO_PER_MINUTE,
  RATE_LIMIT_WINDOW_SECONDS,
} from '@reivo/shared';
import type { Context, Next } from 'hono';

/**
 * Rate limiting middleware using Cloudflare KV.
 *
 * Uses a fixed-window counter per user per minute.
 * KV key: `rl:{userId}:{windowId}` with TTL = window size.
 *
 * Free: 60 req/min, Pro: 300 req/min.
 */
export async function rateLimitMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  if (!user) {
    await next();
    return;
  }

  const limit = user.plan === 'pro' ? RATE_LIMIT_PRO_PER_MINUTE : RATE_LIMIT_FREE_PER_MINUTE;
  const windowId = Math.floor(Date.now() / 1000 / RATE_LIMIT_WINDOW_SECONDS);
  const key = `rl:${user.id}:${windowId}`;

  const kv = c.env.BUDGET_KV;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  // Set rate limit headers
  c.header('X-RateLimit-Limit', String(limit));
  c.header('X-RateLimit-Remaining', String(Math.max(0, limit - count - 1)));
  c.header('X-RateLimit-Reset', String((windowId + 1) * RATE_LIMIT_WINDOW_SECONDS));

  if (count >= limit) {
    const retryAfter = (windowId + 1) * RATE_LIMIT_WINDOW_SECONDS - Math.floor(Date.now() / 1000);
    c.header('Retry-After', String(Math.max(1, retryAfter)));
    return c.json(
      {
        error: 'rate_limit_exceeded',
        message: `Rate limit exceeded. ${limit} requests per minute allowed on ${user.plan} plan. Retry after ${retryAfter}s.`,
      },
      429,
    );
  }

  // Increment counter with TTL (auto-expires after window)
  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS * 2 });

  await next();
}
