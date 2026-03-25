import { Hono } from 'hono';
import { HEADER_SESSION_ID, HEADER_AGENT_ID } from '@tokenscope/shared';
import { googleProvider } from '../providers/google.js';
import { createStreamPassthrough } from '../utils/streaming.js';
import { runAsyncPipeline } from '../async/pipeline.js';
import type { Env, UserRecord } from '../types/index.js';

type HonoEnv = {
  Bindings: Env;
  Variables: { user: UserRecord; requestId: string; startTime: number };
};

const google = new Hono<HonoEnv>();

// Extract model from Google's URL path pattern: /google/v1beta/models/{model}:generateContent
function extractModelFromPath(path: string): string {
  const match = path.match(/\/models\/([^/:]+)/);
  return match?.[1] ?? 'unknown';
}

google.all('/google/*', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const startTime = c.get('startTime');
  const sessionId = c.req.header(HEADER_SESSION_ID) ?? null;
  const agentId = c.req.header(HEADER_AGENT_ID) ?? null;

  const providerKey = user.providerKeys.google;
  if (!providerKey) {
    return c.json({ error: 'No Google API key configured' }, 400);
  }

  const upstreamUrl = googleProvider.buildUpstreamUrl(c.req.path);
  const model = extractModelFromPath(c.req.path);
  const body = await c.req.text();
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(body);
  } catch {
    parsedBody = {};
  }

  const isStream = c.req.path.includes('streamGenerateContent');

  const headers = googleProvider.buildHeaders(providerKey, c.req.raw.headers);

  const upstreamResponse = await fetch(upstreamUrl, {
    method: c.req.method,
    headers,
    body: c.req.method !== 'GET' ? body : undefined,
  });

  const latencyMs = Date.now() - startTime;

  if (isStream && upstreamResponse.body) {
    const { readable, usagePromise } = createStreamPassthrough(
      upstreamResponse.body,
      googleProvider,
    );

    c.executionCtx.waitUntil(
      usagePromise.then((usage) =>
        runAsyncPipeline(c.env, {
          requestId,
          user,
          provider: 'google',
          model,
          body: parsedBody,
          usage,
          latencyMs,
          sessionId,
          agentId,
          blocked: false,
        }),
      ),
    );

    return new Response(readable, {
      status: upstreamResponse.status,
      headers: upstreamResponse.headers,
    });
  }

  const responseBody = await upstreamResponse.text();
  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(responseBody);
  } catch {
    parsedResponse = {};
  }

  const usage = googleProvider.extractUsage(parsedResponse);

  c.executionCtx.waitUntil(
    runAsyncPipeline(c.env, {
      requestId,
      user,
      provider: 'google',
      model,
      body: parsedBody,
      usage,
      latencyMs,
      sessionId,
      agentId,
      blocked: false,
    }),
  );

  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: upstreamResponse.headers,
  });
});

export { google };
