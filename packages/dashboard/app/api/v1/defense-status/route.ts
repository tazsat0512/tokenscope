import { and, eq, gte, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { loopEvents, requestLogs, users } from '../../../../db/schema';
import { authenticateApiKey } from '../../../../lib/api-auth';
import { db } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) return auth.error;

  const user = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);
  const budgetLimit = user[0]?.budgetLimitUsd ?? null;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const now = Date.now();
  const today = now - 24 * 60 * 60 * 1000;
  const week = now - 7 * 24 * 60 * 60 * 1000;

  const [costResult, loopsToday, loopsWeek, blockedToday, blockedWeek] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${requestLogs.costUsd}), 0)` })
      .from(requestLogs)
      .where(
        and(eq(requestLogs.userId, auth.userId), gte(requestLogs.timestamp, monthStart.getTime())),
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(loopEvents)
      .where(and(eq(loopEvents.userId, auth.userId), gte(loopEvents.detectedAt, today))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(loopEvents)
      .where(and(eq(loopEvents.userId, auth.userId), gte(loopEvents.detectedAt, week))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(requestLogs)
      .where(
        and(
          eq(requestLogs.userId, auth.userId),
          eq(requestLogs.blocked, true),
          gte(requestLogs.timestamp, today),
        ),
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(requestLogs)
      .where(
        and(
          eq(requestLogs.userId, auth.userId),
          eq(requestLogs.blocked, true),
          gte(requestLogs.timestamp, week),
        ),
      ),
  ]);

  const budgetUsed = costResult[0]?.total ?? 0;

  return NextResponse.json({
    budgetLimit,
    budgetUsed,
    budgetPercent: budgetLimit ? Math.round((budgetUsed / budgetLimit) * 100) : null,
    loopsToday: loopsToday[0]?.count ?? 0,
    loopsWeek: loopsWeek[0]?.count ?? 0,
    blockedToday: blockedToday[0]?.count ?? 0,
    blockedWeek: blockedWeek[0]?.count ?? 0,
  });
}
