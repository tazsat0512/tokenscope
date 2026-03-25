import { Hono } from 'hono';
import { HEADER_SESSION_ID, HEADER_AGENT_ID } from '@tokenscope/shared';
import { anthropicProvider } from '../providers/anthropic.js';
import { createStreamPassthrough } from '../utils/streaming.js';
import { runAsyncPipeline } from '../async/pipeline.js';
import type { Env, UserRecord } from '../types/index.js';

type HonoEnv = {
  Bindings: Env;
  Variables: { user: UserRecord; requestId: string; startTime: number };
};

const anthropic = new Hono<HonoEnv>();

anthropic.all('/anthropic/*', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const startTime = c.get('startTime');
  const sessionId = c.req.header(HEADER_SESSION_ID) ?? null;
  const agentId = c.req.header(HEADER_AGENT_ID) ?? null;

  const providerKey = user.providerKeys.anthropic;
  if (!providerKey) {
    return c.json({ error: 'No Anthropic API key configured' }, 400);
  }

  const upstreamUrl = anthropicProvider.buildUpstreamUrl(c.req.path);
  const body = await c.req.text();
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(body);
  } catch {
    parsedBody = {};
  }

  const isStream = (parsedBody as Record<string, unknown>)?.stream === true;
  const model = anthropicProvider.extractModel(parsedBody);

  const headers = anthropicProvider.buildHeaders(providerKey, c.req.raw.headers);
  headers.set('Content-Type', 'application/json');

  const upstreamResponse = await fetch(upstreamUrl, {
    method: c.req.method,
    headers,
    body: c.req.method !== 'GET' ? body : undefined,
  });

  const latencyMs = Date.now() - startTime;

  if (isStream && upstreamResponse.body) {
    const { readable, usagePromise } = createStreamPassthrough(
      upstreamResponse.body,
      anthropicProvider,
    );

    c.executionCtx.waitUntil(
      usagePromise.then((usage) =>
        runAsyncPipeline(c.env, {
          requestId,
          user,
          provider: 'anthropic',
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

  const usage = anthropicProvider.extractUsage(parsedResponse);

  c.executionCtx.waitUntil(
    runAsyncPipeline(c.env, {
      requestId,
      user,
      provider: 'anthropic',
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

export { anthropic };
