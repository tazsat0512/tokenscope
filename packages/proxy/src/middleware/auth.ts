import { API_KEY_PREFIX } from '@reivo/shared';
import { createMiddleware } from 'hono/factory';
import type { Env, UserRecord } from '../types/index.js';
import { sha256 } from '../utils/hash.js';

type HonoEnv = { Bindings: Env; Variables: { user: UserRecord; budgetAlert?: boolean; forceAggressiveRouting?: boolean } };

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith(`Bearer ${API_KEY_PREFIX}`)) {
    return c.json({ error: 'Invalid API key. Use a Reivo key (rv_...)' }, 401);
  }

  const apiKey = authHeader.slice(7); // Remove "Bearer "
  const keyHash = await sha256(apiKey);

  const userJson = await c.env.USERS_KV.get(`key:${keyHash}`);
  if (!userJson) {
    return c.json({ error: 'Unknown API key' }, 401);
  }

  const user = JSON.parse(userJson) as UserRecord;
  c.set('user', user);
  await next();
});
