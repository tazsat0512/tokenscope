import { calculateCost } from '@reivo/shared';
import { and, eq, gte, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../db/client.js';
import { requestLogs } from '../db/schema.js';
import type { Env, UserRecord } from '../types/index.js';

type HonoEnv = {
  Bindings: Env;
  Variables: {
    user: UserRecord;
    requestId: string;
    startTime: number;
  };
};

const stats = new Hono<HonoEnv>();

stats.get('/v1/stats', async (c) => {
  const user = c.get('user');
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Monthly start
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartMs = monthStart.getTime();

  // Summary stats (30 days)
  const summary = await db
    .select({
      totalCost: sql<number>`coalesce(sum(${requestLogs.costUsd}), 0)`,
      totalRequests: sql<number>`count(*)`,
      totalInputTokens: sql<number>`coalesce(sum(${requestLogs.inputTokens}), 0)`,
      totalOutputTokens: sql<number>`coalesce(sum(${requestLogs.outputTokens}), 0)`,
    })
    .from(requestLogs)
    .where(and(eq(requestLogs.userId, user.id), gte(requestLogs.timestamp, thirtyDaysAgo)));

  // This month stats
  const monthStats = await db
    .select({
      totalCost: sql<number>`coalesce(sum(${requestLogs.costUsd}), 0)`,
      totalRequests: sql<number>`count(*)`,
    })
    .from(requestLogs)
    .where(and(eq(requestLogs.userId, user.id), gte(requestLogs.timestamp, monthStartMs)));

  // Routing savings (30 days)
  const routedRows = await db
    .select({
      model: requestLogs.model,
      inputTokens: requestLogs.inputTokens,
      outputTokens: requestLogs.outputTokens,
      costUsd: requestLogs.costUsd,
      qualityFallback: requestLogs.qualityFallback,
    })
    .from(requestLogs)
    .where(
      and(
        eq(requestLogs.userId, user.id),
        gte(requestLogs.timestamp, thirtyDaysAgo),
        sql`${requestLogs.routedModel} is not null`,
      ),
    );

  let totalSavedUsd = 0;
  let routedCount = 0;
  for (const r of routedRows) {
    if (r.qualityFallback) continue;
    const originalCost = calculateCost(r.model, r.inputTokens, r.outputTokens);
    totalSavedUsd += originalCost - r.costUsd;
    routedCount++;
  }

  // Top models (30 days)
  const topModels = await db
    .select({
      model: requestLogs.model,
      cost: sql<number>`sum(${requestLogs.costUsd})`,
      count: sql<number>`count(*)`,
    })
    .from(requestLogs)
    .where(and(eq(requestLogs.userId, user.id), gte(requestLogs.timestamp, thirtyDaysAgo)))
    .groupBy(requestLogs.model)
    .orderBy(sql`sum(${requestLogs.costUsd}) desc`)
    .limit(5);

  // Top agents (30 days)
  const topAgents = await db
    .select({
      agentId: requestLogs.agentId,
      cost: sql<number>`sum(${requestLogs.costUsd})`,
      count: sql<number>`count(*)`,
    })
    .from(requestLogs)
    .where(and(eq(requestLogs.userId, user.id), gte(requestLogs.timestamp, thirtyDaysAgo)))
    .groupBy(requestLogs.agentId)
    .orderBy(sql`sum(${requestLogs.costUsd}) desc`)
    .limit(5);

  return c.json({
    period: '30d',
    summary: summary[0],
    month: monthStats[0],
    routing: {
      routedRequests: routedCount,
      savedUsd: Math.round(totalSavedUsd * 10000) / 10000,
    },
    topModels,
    topAgents,
    plan: user.plan,
    budgetLimitUsd: user.budgetLimitUsd,
  });
});

export { stats };
