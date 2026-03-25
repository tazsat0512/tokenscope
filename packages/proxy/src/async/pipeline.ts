import type { ProviderName, TokenUsage } from '@tokenscope/shared';
import { createDb } from '../db/client.js';
import { requestLogs } from '../db/schema.js';
import { estimateCost } from '../services/cost-calculator.js';
import { addCost, getBudgetState, setBudgetState, getTriggeredAlertThreshold } from '../services/budget-store.js';
import { getLoopState, setLoopState, detectLoopByHash } from '../services/loop-detector.js';
import { sendSlackNotification } from '../services/notifier.js';
import { hashPrompt } from '../utils/hash.js';
import type { Env, UserRecord } from '../types/index.js';

export interface PipelineInput {
  requestId: string;
  user: UserRecord;
  provider: ProviderName;
  model: string;
  body: unknown;
  usage: TokenUsage;
  latencyMs: number;
  sessionId: string | null;
  agentId: string | null;
  blocked: boolean;
  blockReason?: string;
}

export async function runAsyncPipeline(
  env: Env,
  input: PipelineInput,
): Promise<void> {
  const costUsd = estimateCost(input.model, input.usage);
  const promptHash = await hashPrompt(input.body);

  // 1. Write to Turso
  const db = createDb(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN);
  await db.insert(requestLogs).values({
    id: input.requestId,
    userId: input.user.id,
    sessionId: input.sessionId,
    agentId: input.agentId,
    provider: input.provider,
    model: input.model,
    inputTokens: input.usage.inputTokens,
    outputTokens: input.usage.outputTokens,
    costUsd,
    promptHash,
    latencyMs: input.latencyMs,
    timestamp: Date.now(),
    blocked: input.blocked,
    blockReason: input.blockReason,
  });

  // 2. Update budget in KV (sync KV with new cost)
  if (!input.blocked) {
    const budgetState = await addCost(env.BUDGET_KV, input.user.id, costUsd);

    // Check for budget alerts
    if (input.user.budgetLimitUsd !== null && input.user.slackWebhookUrl) {
      const threshold = getTriggeredAlertThreshold(
        budgetState.usedUsd,
        input.user.budgetLimitUsd,
        budgetState.lastAlertThreshold,
      );
      if (threshold !== null) {
        budgetState.lastAlertThreshold = threshold;
        await setBudgetState(env.BUDGET_KV, input.user.id, budgetState);

        const pct = Math.round(threshold * 100);
        await sendSlackNotification(input.user.slackWebhookUrl, {
          type: threshold >= 1.0 ? 'budget_exceeded' : 'budget_warning',
          userId: input.user.id,
          message: `Budget usage at ${pct}%: $${budgetState.usedUsd.toFixed(4)} / $${input.user.budgetLimitUsd.toFixed(2)}`,
          details: {
            'Used': `$${budgetState.usedUsd.toFixed(4)}`,
            'Limit': `$${input.user.budgetLimitUsd.toFixed(2)}`,
            'Model': input.model,
            'Provider': input.provider,
          },
          timestamp: Date.now(),
        });
      }
    }
  }

  // 3. Update loop detection state in KV
  const loopState = await getLoopState(env.BUDGET_KV, input.user.id);
  const loopResult = detectLoopByHash(loopState.hashes, promptHash);

  loopState.hashes = [...loopState.hashes.slice(-(19)), promptHash]; // Keep last 20
  if (loopResult.isLoop && !loopState.blocked) {
    loopState.blocked = true;
    loopState.blockedAt = Date.now();

    if (input.user.slackWebhookUrl) {
      await sendSlackNotification(input.user.slackWebhookUrl, {
        type: 'loop_detected',
        userId: input.user.id,
        message: `Repeated prompt detected (${loopResult.matchCount} occurrences in last 20 requests)`,
        details: {
          'Match Count': String(loopResult.matchCount),
          'Session': input.sessionId ?? 'N/A',
          'Agent': input.agentId ?? 'N/A',
          'Model': input.model,
        },
        timestamp: Date.now(),
      });
    }
  }
  await setLoopState(env.BUDGET_KV, input.user.id, loopState);
}
