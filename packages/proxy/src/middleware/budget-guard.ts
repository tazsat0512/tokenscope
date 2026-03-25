import { HEADER_BUDGET_REMAINING, HEADER_BUDGET_USED } from '@tokenscope/shared';
import { createMiddleware } from 'hono/factory';
import { checkBudget, getBudgetState } from '../services/budget-store.js';
import type { Env, UserRecord } from '../types/index.js';

type HonoEnv = { Bindings: Env; Variables: { user: UserRecord } };

export const budgetGuardMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const user = c.get('user');

  if (user.budgetLimitUsd === null) {
    await next();
    return;
  }

  const state = await getBudgetState(c.env.BUDGET_KV, user.id);
  const status = checkBudget(state, user.budgetLimitUsd);

  if (status.blocked) {
    return c.json(
      {
        error: 'Budget exceeded',
        budget_used: status.usedUsd.toFixed(4),
        budget_limit: status.limitUsd?.toFixed(4),
      },
      429,
      {
        [HEADER_BUDGET_USED]: status.usedUsd.toFixed(4),
        [HEADER_BUDGET_REMAINING]: '0',
      },
    );
  }

  // Inject budget headers in response
  await next();
  c.res.headers.set(HEADER_BUDGET_USED, status.usedUsd.toFixed(4));
  if (status.remainingUsd !== null) {
    c.res.headers.set(HEADER_BUDGET_REMAINING, status.remainingUsd.toFixed(4));
  }
});
