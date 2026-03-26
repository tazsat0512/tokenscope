import type { Context } from 'hono';

/**
 * Wrap an upstream fetch call with error handling.
 * Returns the Response on success, or a JSON error response on network failure.
 */
export async function fetchUpstream(
  url: string,
  init: RequestInit,
  c: Context,
  requestId: string,
): Promise<Response | { error: true; response: Response }> {
  try {
    return await fetch(url, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    console.error(`[${requestId}] Upstream fetch failed: ${message}`);
    return {
      error: true,
      response: c.json(
        {
          error: 'upstream_error',
          message: `Failed to connect to upstream provider: ${message}`,
          request_id: requestId,
        },
        502,
      ),
    };
  }
}

/**
 * Build a standardised error JSON body that clients can rely on.
 */
export function errorJson(
  code: string,
  message: string,
  requestId: string,
  extra?: Record<string, unknown>,
) {
  return { error: code, message, request_id: requestId, ...extra };
}
