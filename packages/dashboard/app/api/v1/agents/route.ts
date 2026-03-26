import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requestLogs } from '../../../../db/schema';
import { authenticateApiKey } from '../../../../lib/api-auth';
import { db } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) return auth.error;

  const days = Number(req.nextUrl.searchParams.get('days') ?? '30');
  const since = Date.now() - days * 24 * 60 * 60 * 1000;

  const [byAgent, byModel] = await Promise.all([
    db
      .select({
        agentId: requestLogs.agentId,
        totalCost: sql<number>`sum(${requestLogs.costUsd})`,
        requestCount: sql<number>`count(*)`,
        avgLatency: sql<number>`avg(${requestLogs.latencyMs})`,
      })
      .from(requestLogs)
      .where(and(eq(requestLogs.userId, auth.userId), gte(requestLogs.timestamp, since)))
      .groupBy(requestLogs.agentId)
      .orderBy(desc(sql`sum(${requestLogs.costUsd})`)),
    db
      .select({
        model: requestLogs.model,
        totalCost: sql<number>`sum(${requestLogs.costUsd})`,
        requestCount: sql<number>`count(*)`,
      })
      .from(requestLogs)
      .where(and(eq(requestLogs.userId, auth.userId), gte(requestLogs.timestamp, since)))
      .groupBy(requestLogs.model)
      .orderBy(desc(sql`sum(${requestLogs.costUsd})`)),
  ]);

  return NextResponse.json({ byAgent, byModel });
}
