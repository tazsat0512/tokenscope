import { HEADER_REQUEST_ID } from '@tokenscope/shared';
import { createMiddleware } from 'hono/factory';
import type { Env, UserRecord } from '../types/index.js';

type HonoEnv = {
  Bindings: Env;
  Variables: { user: UserRecord; requestId: string; startTime: number };
};

export const requestLoggerMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set('requestId', requestId);
  c.set('startTime', Date.now());

  await next();

  c.res.headers.set(HEADER_REQUEST_ID, requestId);
});
