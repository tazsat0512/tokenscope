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

// --- Provider key helpers ---
interface ProviderKeyEntry {
  id: string;
  label: string;
  key: string;
  isDefault: boolean;
}
type ProviderKeysMap = Record<'openai' | 'anthropic' | 'google', ProviderKeyEntry[]>;

async function loadProviderKeys(userId: string): Promise<ProviderKeysMap> {
  const empty: ProviderKeysMap = { openai: [], anthropic: [], google: [] };
  const user = await db
    .select({ providerKeysEncrypted: users.providerKeysEncrypted })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const raw = user[0]?.providerKeysEncrypted;
  if (!raw || raw === '{}') return empty;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(await decrypt(raw));
  } catch {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return empty;
    }
  }

  // Migrate legacy format: { openai: "sk-..." } → { openai: [{...}] }
  for (const provider of ['openai', 'anthropic', 'google'] as const) {
    const val = parsed[provider];
    if (typeof val === 'string') {
      parsed[provider] = [{ id: crypto.randomUUID(), label: 'Default', key: val, isDefault: true }];
    } else if (!Array.isArray(val)) {
      parsed[provider] = [];
    }
  }

  return parsed as ProviderKeysMap;
}

async function saveProviderKeys(userId: string, keys: ProviderKeysMap): Promise<void> {
  const encrypted = await encrypt(JSON.stringify(keys));
  await db
    .update(users)
    .set({ providerKeysEncrypted: encrypted, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Sync default keys to KV (proxy expects flat { openai: "key", ... })
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user[0]) await syncUserToKV(user[0]);
  } catch (err) {
    console.error('KV sync failed:', err);
  }
}

export const appRouter = t.router({
  getOverview: authedProcedure
    .input(z.object({ days: z.number().default(30), tz: z.string().default('UTC') }))
    .query(async ({ ctx, input }) => {
      const since = Date.now() - input.days * 24 * 60 * 60 * 1000;

      // Calculate UTC offset in seconds for the client's timezone
      const tzOffsetSec = (() => {
        try {
          const now = new Date();
          const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
          const tzStr = now.toLocaleString('en-US', { timeZone: input.tz });
          return (new Date(tzStr).getTime() - new Date(utcStr).getTime()) / 1000;
        } catch {
          return 0;
        }
      })();

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
          date: sql<string>`date(${requestLogs.timestamp} / 1000 + ${tzOffsetSec}, 'unixepoch')`,
          cost: sql<number>`sum(${requestLogs.costUsd})`,
          requests: sql<number>`count(*)`,
        })
        .from(requestLogs)
        .where(and(eq(requestLogs.userId, ctx.userId), gte(requestLogs.timestamp, since)))
        .groupBy(sql`date(${requestLogs.timestamp} / 1000 + ${tzOffsetSec}, 'unixepoch')`)
        .orderBy(sql`date(${requestLogs.timestamp} / 1000 + ${tzOffsetSec}, 'unixepoch')`);

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

  getDefenseStatus: authedProcedure.query(async ({ ctx }) => {
    const user = await db.select().from(users).where(eq(users.id, ctx.userId)).limit(1);
    const budgetLimit = user[0]?.budgetLimitUsd ?? null;

    // Calculate total cost from request logs this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const costResult = await db
      .select({ total: sql<number>`coalesce(sum(${requestLogs.costUsd}), 0)` })
      .from(requestLogs)
      .where(
        and(eq(requestLogs.userId, ctx.userId), gte(requestLogs.timestamp, monthStart.getTime())),
      );
    const budgetUsed = costResult[0]?.total ?? 0;

    const now = Date.now();
    const today = now - 24 * 60 * 60 * 1000;
    const week = now - 7 * 24 * 60 * 60 * 1000;

    const loopsToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(loopEvents)
      .where(and(eq(loopEvents.userId, ctx.userId), gte(loopEvents.detectedAt, today)));

    const loopsWeek = await db
      .select({ count: sql<number>`count(*)` })
      .from(loopEvents)
      .where(and(eq(loopEvents.userId, ctx.userId), gte(loopEvents.detectedAt, week)));

    const blockedToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(requestLogs)
      .where(
        and(
          eq(requestLogs.userId, ctx.userId),
          eq(requestLogs.blocked, true),
          gte(requestLogs.timestamp, today),
        ),
      );

    const blockedWeek = await db
      .select({ count: sql<number>`count(*)` })
      .from(requestLogs)
      .where(
        and(
          eq(requestLogs.userId, ctx.userId),
          eq(requestLogs.blocked, true),
          gte(requestLogs.timestamp, week),
        ),
      );

    return {
      budgetLimit,
      budgetUsed,
      budgetPercent: budgetLimit ? Math.round((budgetUsed / budgetLimit) * 100) : null,
      loopsToday: loopsToday[0]?.count ?? 0,
      loopsWeek: loopsWeek[0]?.count ?? 0,
      blockedToday: blockedToday[0]?.count ?? 0,
      blockedWeek: blockedWeek[0]?.count ?? 0,
    };
  }),

  getOnboardingStatus: authedProcedure.query(async ({ ctx }) => {
    const user = await db.select().from(users).where(eq(users.id, ctx.userId)).limit(1);
    if (!user[0]) return { hasApiKey: false, hasProviderKey: false, hasFirstRequest: false };

    const hasApiKey = !!user[0].apiKeyHash;

    let hasProviderKey = false;
    if (user[0].providerKeysEncrypted && user[0].providerKeysEncrypted !== '{}') {
      try {
        const decrypted = await decrypt(user[0].providerKeysEncrypted);
        const keys = JSON.parse(decrypted);
        hasProviderKey = Object.values(keys).some((v) => !!v);
      } catch {
        try {
          const keys = JSON.parse(user[0].providerKeysEncrypted);
          hasProviderKey = Object.values(keys).some((v) => !!v);
        } catch {
          hasProviderKey = false;
        }
      }
    }

    const reqCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(requestLogs)
      .where(eq(requestLogs.userId, ctx.userId));
    const hasFirstRequest = (reqCount[0]?.count ?? 0) > 0;

    return { hasApiKey, hasProviderKey, hasFirstRequest };
  }),

  getSettings: authedProcedure.query(async ({ ctx }) => {
    const user = await db.select().from(users).where(eq(users.id, ctx.userId)).limit(1);
    return user[0] ?? null;
  }),

  getProviderKeyStatus: authedProcedure.query(async ({ ctx }) => {
    const keys = await loadProviderKeys(ctx.userId);
    return {
      openai: keys.openai.length > 0,
      anthropic: keys.anthropic.length > 0,
      google: keys.google.length > 0,
    };
  }),

  getProviderKeys: authedProcedure.query(async ({ ctx }) => {
    const keys = await loadProviderKeys(ctx.userId);
    // Return keys with masked values
    const mask = (list: ProviderKeyEntry[]) =>
      list.map((k) => ({
        id: k.id,
        label: k.label,
        keyPreview: `${k.key.slice(0, 7)}...${k.key.slice(-4)}`,
        isDefault: k.isDefault,
      }));
    return {
      openai: mask(keys.openai),
      anthropic: mask(keys.anthropic),
      google: mask(keys.google),
    };
  }),

  addProviderKey: authedProcedure
    .input(
      z.object({
        provider: z.enum(['openai', 'anthropic', 'google']),
        label: z.string().min(1).max(50),
        key: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const keys = await loadProviderKeys(ctx.userId);
      const list = keys[input.provider];
      const isFirst = list.length === 0;
      list.push({
        id: crypto.randomUUID(),
        label: input.label,
        key: input.key.replace(/\s+/g, ''),
        isDefault: isFirst,
      });
      await saveProviderKeys(ctx.userId, keys);
      return { success: true };
    }),

  removeProviderKey: authedProcedure
    .input(z.object({ provider: z.enum(['openai', 'anthropic', 'google']), keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const keys = await loadProviderKeys(ctx.userId);
      const list = keys[input.provider];
      const idx = list.findIndex((k) => k.id === input.keyId);
      if (idx === -1) return { success: false };
      const wasDefault = list[idx].isDefault;
      list.splice(idx, 1);
      if (wasDefault && list.length > 0) list[0].isDefault = true;
      await saveProviderKeys(ctx.userId, keys);
      return { success: true };
    }),

  setDefaultProviderKey: authedProcedure
    .input(z.object({ provider: z.enum(['openai', 'anthropic', 'google']), keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const keys = await loadProviderKeys(ctx.userId);
      for (const k of keys[input.provider]) {
        k.isDefault = k.id === input.keyId;
      }
      await saveProviderKeys(ctx.userId, keys);
      return { success: true };
    }),

  generateApiKey: authedProcedure.mutation(async ({ ctx }) => {
    const apiKey = `rv_${crypto.randomUUID().replace(/-/g, '')}`;
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
