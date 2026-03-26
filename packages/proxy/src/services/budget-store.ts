import { BUDGET_ALERT_THRESHOLDS, type BudgetStatus } from '@reivo/shared';
import type { BudgetState } from '../types/index.js';

const BUDGET_KEY_PREFIX = 'budget:';

function budgetKey(userId: string, agentId?: string | null): string {
  if (agentId) {
    return `${BUDGET_KEY_PREFIX}${userId}:agent:${agentId}`;
  }
  return `${BUDGET_KEY_PREFIX}${userId}`;
}

export async function getBudgetState(kv: KVNamespace, userId: string): Promise<BudgetState> {
  const raw = await kv.get(budgetKey(userId));
  if (!raw) {
    return { usedUsd: 0, blockedUntil: null, lastAlertThreshold: 0 };
  }
  return JSON.parse(raw) as BudgetState;
}

export async function getAgentBudgetState(
  kv: KVNamespace,
  userId: string,
  agentId: string,
): Promise<BudgetState> {
  const raw = await kv.get(budgetKey(userId, agentId));
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
  await kv.put(budgetKey(userId), JSON.stringify(state));
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

export async function updateAgentBudgetState(
  kv: KVNamespace,
  userId: string,
  agentId: string,
  costUsd: number,
): Promise<BudgetState> {
  const state = await getAgentBudgetState(kv, userId, agentId);
  state.usedUsd += costUsd;
  await kv.put(budgetKey(userId, agentId), JSON.stringify(state));
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
