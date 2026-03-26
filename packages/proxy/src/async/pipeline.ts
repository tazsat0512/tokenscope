import type { ProviderName, TokenUsage } from '@reivo/shared';
import { createDb } from '../db/client.js';
import { requestLogs } from '../db/schema.js';
import { addCost, getTriggeredAlertThreshold, setBudgetState } from '../services/budget-store.js';
import { estimateCost } from '../services/cost-calculator.js';
import { detectLoopByHash, getLoopState, setLoopState } from '../services/loop-detector.js';
import { sendSlackNotification } from '../services/notifier.js';
import type { Env, UserRecord } from '../types/index.js';
import { hashPrompt } from '../utils/hash.js';

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
  // Telemetry expansion
  cachedTokens?: number;
  hasCacheControl?: boolean;
  maxTokensSetting?: number;
  isStreaming?: boolean;
  toolCount?: number;
  toolsUsed?: string[];
  systemPromptHash?: string;
}

function getMonthStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

async function incrementRequestCount(kv: KVNamespace, user: UserRecord): Promise<void> {
  const keyHash = user.apiKeyHash;
  const userJson = await kv.get(`key:${keyHash}`);
  if (!userJson) return;

  const record = JSON.parse(userJson) as UserRecord;
  const monthStart = getMonthStart();

  // Reset if new month
  if ((record.requestCountResetAt ?? 0) < monthStart) {
    record.requestCount = 0;
    record.requestCountResetAt = monthStart;
  }

  record.requestCount = (record.requestCount ?? 0) + 1;
  await kv.put(`key:${keyHash}`, JSON.stringify(record));
}

export async function runAsyncPipeline(env: Env, input: PipelineInput): Promise<void> {
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
    cachedTokens: input.cachedTokens ?? null,
    hasCacheControl: input.hasCacheControl ?? null,
    maxTokensSetting: input.maxTokensSetting ?? null,
    isStreaming: input.isStreaming ?? null,
    toolCount: input.toolCount ?? null,
    toolsUsed: input.toolsUsed ? JSON.stringify(input.toolsUsed) : null,
    systemPromptHash: input.systemPromptHash ?? null,
  });

  // 2. Increment request count in KV (for plan limit enforcement)
  if (!input.blocked) {
    await incrementRequestCount(env.USERS_KV, input.user);
  }

  // 3. Update budget in KV (sync KV with new cost)
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
            Used: `$${budgetState.usedUsd.toFixed(4)}`,
            Limit: `$${input.user.budgetLimitUsd.toFixed(2)}`,
            Model: input.model,
            Provider: input.provider,
          },
          timestamp: Date.now(),
        });
      }
    }
  }

  // 4. Update loop detection state in KV
  const loopState = await getLoopState(env.BUDGET_KV, input.user.id);
  const loopResult = detectLoopByHash(loopState.hashes, promptHash);

  loopState.hashes = [...loopState.hashes.slice(-19), promptHash]; // Keep last 20
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
          Session: input.sessionId ?? 'N/A',
          Agent: input.agentId ?? 'N/A',
          Model: input.model,
        },
        timestamp: Date.now(),
      });
    }
  }
  await setLoopState(env.BUDGET_KV, input.user.id, loopState);
}
