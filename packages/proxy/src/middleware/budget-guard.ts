import {
  HEADER_AGENT_ID,
  HEADER_BUDGET_ACTION,
  HEADER_BUDGET_LIMIT,
  HEADER_BUDGET_REMAINING,
  HEADER_BUDGET_USED,
} from '@reivo/shared';
import { createMiddleware } from 'hono/factory';
import { checkBudget, getAgentBudgetState, getBudgetState } from '../services/budget-store.js';
import type { BudgetAction, BudgetPolicy, Env, UserRecord } from '../types/index.js';

type HonoEnv = {
  Bindings: Env;
  Variables: {
    user: UserRecord;
    budgetAlert?: boolean;
    forceAggressiveRouting?: boolean;
  };
};

/**
 * Resolve the applicable budget policy for this request.
 *
 * Priority:
 *   1. Per-agent policy (if agentId is present and user has a matching agentBudgets entry)
 *   2. Global policy (user.budgetLimitUsd)
 *
 * Returns null when no budget is configured at all.
 */
function resolvePolicy(
  user: UserRecord,
  agentId: string | null,
): { policy: BudgetPolicy; isAgent: boolean } | null {
  // Try agent-specific budget first
  if (agentId && user.agentBudgets?.length) {
    const agentPolicy = user.agentBudgets.find((p) => p.agentId === agentId);
    if (agentPolicy) {
      return { policy: agentPolicy, isAgent: true };
    }
  }

  // Fall back to global budget
  if (user.budgetLimitUsd === null) {
    return null;
  }

  return {
    policy: {
      agentId: null,
      limitUsd: user.budgetLimitUsd,
      action: user.budgetAction ?? 'block',
    },
    isAgent: false,
  };
}

export const budgetGuardMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const user = c.get('user');
  const agentId = c.req.header(HEADER_AGENT_ID) ?? null;

  const resolved = resolvePolicy(user, agentId);

  // No budget configured -- pass through
  if (!resolved) {
    await next();
    return;
  }

  const { policy, isAgent } = resolved;
  const action: BudgetAction = policy.action ?? 'block';

  // Fetch the appropriate budget state from KV
  const state = isAgent
    ? await getAgentBudgetState(c.env.BUDGET_KV, user.id, policy.agentId!)
    : await getBudgetState(c.env.BUDGET_KV, user.id);

  const status = checkBudget(state, policy.limitUsd);

  // Helper: set common budget response headers
  const setBudgetHeaders = (headers: Headers) => {
    headers.set(HEADER_BUDGET_USED, status.usedUsd.toFixed(4));
    if (status.limitUsd !== null) {
      headers.set(HEADER_BUDGET_LIMIT, status.limitUsd.toFixed(4));
    }
    if (status.remainingUsd !== null) {
      headers.set(HEADER_BUDGET_REMAINING, status.remainingUsd.toFixed(4));
    }
    headers.set(HEADER_BUDGET_ACTION, action);
  };

  if (status.blocked) {
    switch (action) {
      case 'block': {
        const resHeaders = new Headers();
        setBudgetHeaders(resHeaders);
        return c.json(
          {
            error: 'Budget exceeded',
            budget_used: status.usedUsd.toFixed(4),
            budget_limit: status.limitUsd?.toFixed(4),
            budget_action: action,
          },
          429,
          Object.fromEntries(resHeaders),
        );
      }

      case 'alert': {
        // Pass through but signal that an alert should be sent
        c.set('budgetAlert', true);
        await next();
        setBudgetHeaders(c.res.headers);
        return;
      }

      case 'downgrade': {
        // Pass through but force aggressive routing
        c.set('forceAggressiveRouting', true);
        await next();
        setBudgetHeaders(c.res.headers);
        return;
      }
    }
  }

  // Budget not exceeded -- continue normally
  await next();
  setBudgetHeaders(c.res.headers);
});
