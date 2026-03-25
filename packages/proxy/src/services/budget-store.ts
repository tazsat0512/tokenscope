import { BUDGET_ALERT_THRESHOLDS, type BudgetStatus } from '@tokenscope/shared';
import type { BudgetState } from '../types/index.js';

const BUDGET_KEY_PREFIX = 'budget:';

export async function getBudgetState(kv: KVNamespace, userId: string): Promise<BudgetState> {
  const raw = await kv.get(`${BUDGET_KEY_PREFIX}${userId}`);
  if (!raw) {
    return { usedUsd: 0, blockedUntil: null, lastAlertThreshold: 0 };
  }
  return JSON.parse(raw) as BudgetState;
}

export async function setBudgetState(
  kv: KVNamespace,
  userId: string,
  state: BudgetState,
): Promise<void> {
  await kv.put(`${BUDGET_KEY_PREFIX}${userId}`, JSON.stringify(state));
}

export async function addCost(
  kv: KVNamespace,
  userId: string,
  costUsd: number,
): Promise<BudgetState> {
  const state = await getBudgetState(kv, userId);
  state.usedUsd += costUsd;
  await setBudgetState(kv, userId, state);
  return state;
}

export function checkBudget(state: BudgetState, limitUsd: number | null): BudgetStatus {
  if (limitUsd === null) {
    return {
      limitUsd: null,
      usedUsd: state.usedUsd,
      remainingUsd: null,
      blocked: false,
    };
  }

  const remaining = limitUsd - state.usedUsd;
  return {
    limitUsd,
    usedUsd: state.usedUsd,
    remainingUsd: Math.max(0, remaining),
    blocked:
      state.usedUsd >= limitUsd || (state.blockedUntil !== null && Date.now() < state.blockedUntil),
  };
}

export function getTriggeredAlertThreshold(
  usedUsd: number,
  limitUsd: number,
  lastAlertThreshold: number,
): number | null {
  const ratio = usedUsd / limitUsd;
  for (const threshold of BUDGET_ALERT_THRESHOLDS) {
    if (ratio >= threshold && lastAlertThreshold < threshold) {
      return threshold;
    }
  }
  return null;
}
