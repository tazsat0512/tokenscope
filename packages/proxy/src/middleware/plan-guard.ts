import { FREE_PLAN_REQUEST_LIMIT, PRO_PLAN_REQUEST_LIMIT } from '@reivo/shared';
import { createMiddleware } from 'hono/factory';
import type { Env, UserRecord } from '../types/index.js';

type HonoEnv = { Bindings: Env; Variables: { user: UserRecord; budgetAlert?: boolean; forceAggressiveRouting?: boolean } };

function getMonthStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function getPlanLimit(plan: string): number {
  return plan === 'pro' ? PRO_PLAN_REQUEST_LIMIT : FREE_PLAN_REQUEST_LIMIT;
}

export const planGuardMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const user = c.get('user');
  const monthStart = getMonthStart();

  // Reset count if we're in a new month
  let requestCount = user.requestCount ?? 0;
  if ((user.requestCountResetAt ?? 0) < monthStart) {
    requestCount = 0;
  }

  const limit = getPlanLimit(user.plan ?? 'free');

  if (requestCount >= limit) {
    return c.json(
      {
        error: 'Plan request limit exceeded',
        plan: user.plan ?? 'free',
        request_count: requestCount,
        request_limit: limit,
        message:
          user.plan === 'pro'
            ? 'Pro plan limit reached. Contact support for higher limits.'
            : 'Free plan limit reached. Upgrade to Pro for 100,000 requests/month.',
      },
      429,
    );
  }

  await next();
});
