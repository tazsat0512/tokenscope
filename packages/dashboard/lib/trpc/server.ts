import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { loopEvents, requestLogs, users } from '../../db/schema';
import { sha256 } from '../crypto';
import { db } from '../db';
import { decrypt, encrypt } from '../encryption';
import { deleteOldKVEntry, syncUserToKV } from '../kv-sync';

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

  getProviderKeyStatus: authedProcedure.query(async ({ ctx }) => {
    const user = await db
      .select({ providerKeysEncrypted: users.providerKeysEncrypted })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);

    if (!user[0]?.providerKeysEncrypted || user[0].providerKeysEncrypted === '{}') {
      return { openai: false, anthropic: false, google: false };
    }

    try {
      const decrypted = await decrypt(user[0].providerKeysEncrypted);
      const keys = JSON.parse(decrypted);
      return {
        openai: !!keys.openai,
        anthropic: !!keys.anthropic,
        google: !!keys.google,
      };
    } catch {
      // Legacy unencrypted data
      try {
        const keys = JSON.parse(user[0].providerKeysEncrypted);
        return {
          openai: !!keys.openai,
          anthropic: !!keys.anthropic,
          google: !!keys.google,
        };
      } catch {
        return { openai: false, anthropic: false, google: false };
      }
    }
  }),

  generateApiKey: authedProcedure.mutation(async ({ ctx }) => {
    const apiKey = `ts_${crypto.randomUUID().replace(/-/g, '')}`;
    const apiKeyHash = await sha256(apiKey);

    // Get old hash to clean up KV
    const existing = await db
      .select({ apiKeyHash: users.apiKeyHash })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);
    const oldHash = existing[0]?.apiKeyHash;

    // Update DB
    await db
      .update(users)
      .set({ apiKeyHash, updatedAt: new Date() })
      .where(eq(users.id, ctx.userId));

    // Sync to KV
    try {
      if (oldHash) await deleteOldKVEntry(oldHash);
      const user = await db.select().from(users).where(eq(users.id, ctx.userId)).limit(1);
      if (user[0]) await syncUserToKV(user[0]);
    } catch (err) {
      console.error('KV sync failed:', err);
    }

    return { apiKey };
  }),

  updateSettings: authedProcedure
    .input(
      z.object({
        budgetLimitUsd: z.number().nullable().optional(),
        slackWebhookUrl: z.string().nullable().optional(),
        providerKeys: z
          .object({
            openai: z.string().nullable().optional(),
            anthropic: z.string().nullable().optional(),
            google: z.string().nullable().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, any> = { updatedAt: new Date() };

      if (input.budgetLimitUsd !== undefined) {
        updates.budgetLimitUsd = input.budgetLimitUsd;
      }
      if (input.slackWebhookUrl !== undefined) {
        updates.slackWebhookUrl = input.slackWebhookUrl;
      }

      // Handle provider keys
      if (input.providerKeys) {
        const user = await db
          .select({ providerKeysEncrypted: users.providerKeysEncrypted })
          .from(users)
          .where(eq(users.id, ctx.userId))
          .limit(1);

        let existing: Record<string, string | null> = {};
        const raw = user[0]?.providerKeysEncrypted;
        if (raw && raw !== '{}') {
          try {
            existing = JSON.parse(await decrypt(raw));
          } catch {
            try {
              existing = JSON.parse(raw);
            } catch {
              existing = {};
            }
          }
        }

        // Merge: undefined = don't change, null = remove, string = set
        for (const [provider, value] of Object.entries(input.providerKeys)) {
          if (value === undefined) continue;
          if (value === null) {
            delete existing[provider];
          } else {
            existing[provider] = value;
          }
        }

        updates.providerKeysEncrypted = await encrypt(JSON.stringify(existing));
      }

      await db.update(users).set(updates).where(eq(users.id, ctx.userId));

      // Sync to KV
      try {
        const user = await db.select().from(users).where(eq(users.id, ctx.userId)).limit(1);
        if (user[0]) await syncUserToKV(user[0]);
      } catch (err) {
        console.error('KV sync failed:', err);
      }

      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;
