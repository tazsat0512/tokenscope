import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../../../db/schema';
import { authenticateApiKey } from '../../../../lib/api-auth';
import { db } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) return auth.error;

  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if ('budgetLimitUsd' in body) {
    const val = body.budgetLimitUsd;
    if (val !== null && (typeof val !== 'number' || val < 0)) {
      return NextResponse.json(
        { error: 'budgetLimitUsd must be a positive number or null' },
        { status: 400 },
      );
    }
    updates.budgetLimitUsd = val;
  }

  if ('slackWebhookUrl' in body) {
    updates.slackWebhookUrl = body.slackWebhookUrl;
  }

  await db.update(users).set(updates).where(eq(users.id, auth.userId));

  return NextResponse.json({ success: true });
}
