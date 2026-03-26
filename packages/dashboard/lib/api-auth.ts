import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { users } from '../db/schema';
import { sha256 } from './crypto';
import { db } from './db';

/**
 * Authenticate REST API requests using Reivo API key (rv_...).
 * Used by the OpenClaw skill and other external integrations.
 */
export async function authenticateApiKey(
  req: NextRequest,
): Promise<{ userId: string } | { error: NextResponse }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer rv_')) {
    return {
      error: NextResponse.json(
        { error: 'Missing or invalid API key. Use: Authorization: Bearer rv_...' },
        { status: 401 },
      ),
    };
  }

  const apiKey = authHeader.slice(7);
  const apiKeyHash = await sha256(apiKey);

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.apiKeyHash, apiKeyHash))
    .limit(1);

  if (!user[0]) {
    return {
      error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }),
    };
  }

  return { userId: user[0].id };
}
