import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { requestLogs } from '../../../../db/schema';
import { authenticateApiKey } from '../../../../lib/api-auth';
import { db } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) return auth.error;

  const days = Number(req.nextUrl.searchParams.get('days') ?? '30');
  const tz = req.nextUrl.searchParams.get('tz') ?? 'UTC';
  const since = Date.now() - days * 24 * 60 * 60 * 1000;

  // Calculate UTC offset in seconds for the requested timezone
  const tzOffsetSec = (() => {
    try {
      const now = new Date();
      const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
      const tzStr = now.toLocaleString('en-US', { timeZone: tz });
      return (new Date(tzStr).getTime() - new Date(utcStr).getTime()) / 1000;
    } catch {
      return 0;
    }
  })();

  const [summary, dailyCosts, topModels] = await Promise.all([
    db
      .select({
        totalCost: sql<number>`coalesce(sum(${requestLogs.costUsd}), 0)`,
        totalRequests: sql<number>`count(*)`,
        totalInputTokens: sql<number>`coalesce(sum(${requestLogs.inputTokens}), 0)`,
        totalOutputTokens: sql<number>`coalesce(sum(${requestLogs.outputTokens}), 0)`,
      })
      .from(requestLogs)
      .where(and(eq(requestLogs.userId, auth.userId), gte(requestLogs.timestamp, since))),
    db
      .select({
        date: sql<string>`date(${requestLogs.timestamp} / 1000 + ${tzOffsetSec}, 'unixepoch')`,
        cost: sql<number>`sum(${requestLogs.costUsd})`,
        requests: sql<number>`count(*)`,
      })
      .from(requestLogs)
      .where(and(eq(requestLogs.userId, auth.userId), gte(requestLogs.timestamp, since)))
      .groupBy(sql`date(${requestLogs.timestamp} / 1000 + ${tzOffsetSec}, 'unixepoch')`)
      .orderBy(sql`date(${requestLogs.timestamp} / 1000 + ${tzOffsetSec}, 'unixepoch')`),
    db
      .select({
        model: requestLogs.model,
        cost: sql<number>`sum(${requestLogs.costUsd})`,
        requests: sql<number>`count(*)`,
      })
      .from(requestLogs)
      .where(and(eq(requestLogs.userId, auth.userId), gte(requestLogs.timestamp, since)))
      .groupBy(requestLogs.model)
      .orderBy(desc(sql`sum(${requestLogs.costUsd})`))
      .limit(5),
  ]);

  return NextResponse.json({
    summary: summary[0],
    dailyCosts,
    topModels,
  });
}
