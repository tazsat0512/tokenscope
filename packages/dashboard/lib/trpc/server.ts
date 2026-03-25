import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { loopEvents, requestLogs, users } from '../../db/schema';
import { db } from '../db';

const t = initTRPC.create();

const authedProcedure = t.procedure.use(async ({ next }) => {
  const { userId } = await auth();
  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { userId } });
});

export const appRouter = t.router({
  getOverview: authedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const since = Date.now() - input.days * 24 * 60 * 60 * 1000;

      const logs = await db
        .select({
          totalCost: sql<number>`sum(${requestLogs.costUsd})`,
          totalRequests: sql<number>`count(*)`,
          totalInputTokens: sql<number>`sum(${requestLogs.inputTokens})`,
          totalOutputTokens: sql<number>`sum(${requestLogs.outputTokens})`,
        })
        .from(requestLogs)
        .where(and(eq(requestLogs.userId, ctx.userId), gte(requestLogs.timestamp, since)));

      const dailyCosts = await db
        .select({
          date: sql<string>`date(${requestLogs.timestamp} / 1000, 'unixepoch')`,
          cost: sql<number>`sum(${requestLogs.costUsd})`,
          requests: sql<number>`count(*)`,
        })
        .from(requestLogs)
        .where(and(eq(requestLogs.userId, ctx.userId), gte(requestLogs.timestamp, since)))
        .groupBy(sql`date(${requestLogs.timestamp} / 1000, 'unixepoch')`)
        .orderBy(sql`date(${requestLogs.timestamp} / 1000, 'unixepoch')`);

      return {
        summary: logs[0] ?? {
          totalCost: 0,
          totalRequests: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0,
        },
        dailyCosts,
      };
    }),

  getSessions: authedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sessions = await db
        .select({
          sessionId: requestLogs.sessionId,
          agentId: requestLogs.agentId,
          totalCost: sql<number>`sum(${requestLogs.costUsd})`,
          requestCount: sql<number>`count(*)`,
          firstRequest: sql<number>`min(${requestLogs.timestamp})`,
          lastRequest: sql<number>`max(${requestLogs.timestamp})`,
          hasBlocked: sql<boolean>`max(${requestLogs.blocked})`,
        })
        .from(requestLogs)
        .where(eq(requestLogs.userId, ctx.userId))
        .groupBy(requestLogs.sessionId, requestLogs.agentId)
        .orderBy(desc(sql`max(${requestLogs.timestamp})`))
        .limit(input.limit)
        .offset(input.offset);

      return sessions;
    }),

  getSessionDetail: authedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const logs = await db
        .select()
        .from(requestLogs)
        .where(and(eq(requestLogs.userId, ctx.userId), eq(requestLogs.sessionId, input.sessionId)))
        .orderBy(requestLogs.timestamp);

      return logs;
    }),

  getAgentBreakdown: authedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const since = Date.now() - input.days * 24 * 60 * 60 * 1000;

      const breakdown = await db
        .select({
          agentId: requestLogs.agentId,
          totalCost: sql<number>`sum(${requestLogs.costUsd})`,
          requestCount: sql<number>`count(*)`,
          avgLatency: sql<number>`avg(${requestLogs.latencyMs})`,
        })
        .from(requestLogs)
        .where(and(eq(requestLogs.userId, ctx.userId), gte(requestLogs.timestamp, since)))
        .groupBy(requestLogs.agentId)
        .orderBy(desc(sql`sum(${requestLogs.costUsd})`));

      const modelBreakdown = await db
        .select({
          model: requestLogs.model,
          totalCost: sql<number>`sum(${requestLogs.costUsd})`,
          requestCount: sql<number>`count(*)`,
        })
        .from(requestLogs)
        .where(and(eq(requestLogs.userId, ctx.userId), gte(requestLogs.timestamp, since)))
        .groupBy(requestLogs.model)
        .orderBy(desc(sql`sum(${requestLogs.costUsd})`));

      return { byAgent: breakdown, byModel: modelBreakdown };
    }),

  getLoopHistory: authedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const loops = await db
        .select()
        .from(loopEvents)
        .where(eq(loopEvents.userId, ctx.userId))
        .orderBy(desc(loopEvents.detectedAt))
        .limit(input.limit);

      return loops;
    }),

  getSettings: authedProcedure.query(async ({ ctx }) => {
    const user = await db.select().from(users).where(eq(users.id, ctx.userId)).limit(1);

    return user[0] ?? null;
  }),

  updateSettings: authedProcedure
    .input(
      z.object({
        budgetLimitUsd: z.number().nullable().optional(),
        slackWebhookUrl: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(users)
        .set({
          ...(input.budgetLimitUsd !== undefined && { budgetLimitUsd: input.budgetLimitUsd }),
          ...(input.slackWebhookUrl !== undefined && { slackWebhookUrl: input.slackWebhookUrl }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.userId));

      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;
