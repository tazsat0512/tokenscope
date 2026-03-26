import { HEADER_SESSION_ID } from '@reivo/shared';
import type { Context } from 'hono';
import { sha256 } from './hash.js';

const SESSION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Get session ID from header, or auto-generate one from userId + IP + hour window.
 * This ensures requests are grouped into sessions even without explicit headers.
 */
export async function resolveSessionId(c: Context, userId: string): Promise<string> {
  const explicit = c.req.header(HEADER_SESSION_ID);
  if (explicit) return explicit;

  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown';
  const hourWindow = Math.floor(Date.now() / SESSION_WINDOW_MS);
  const raw = `${userId}:${ip}:${hourWindow}`;
  const hash = await sha256(raw);
  return `auto-${hash.slice(0, 16)}`;
}
