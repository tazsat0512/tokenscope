import { HEADER_AGENT_ID, HEADER_SESSION_ID } from '@tokenscope/shared';
import { Hono } from 'hono';
import { runAsyncPipeline } from '../async/pipeline.js';
import { openaiProvider } from '../providers/openai.js';
import type { Env, UserRecord } from '../types/index.js';
import { createStreamPassthrough } from '../utils/streaming.js';
import { extractRequestTelemetry, extractResponseTelemetry } from '../utils/telemetry.js';

type HonoEnv = {
  Bindings: Env;
  Variables: { user: UserRecord; requestId: string; startTime: number };
};

const openai = new Hono<HonoEnv>();

openai.all('/openai/*', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const startTime = c.get('startTime');
  const sessionId = c.req.header(HEADER_SESSION_ID) ?? null;
  const agentId = c.req.header(HEADER_AGENT_ID) ?? null;

  const providerKey = user.providerKeys.openai;
  if (!providerKey) {
    return c.json({ error: 'No OpenAI API key configured' }, 400);
  }

  const upstreamUrl = openaiProvider.buildUpstreamUrl(c.req.path);
  const body = await c.req.text();
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(body);
  } catch {
    parsedBody = {};
  }

  const model = openaiProvider.extractModel(parsedBody);
  const reqTelemetry = await extractRequestTelemetry(parsedBody);

  const headers = openaiProvider.buildHeaders(providerKey, c.req.raw.headers);
  headers.set('Content-Type', 'application/json');

  const upstreamResponse = await fetch(upstreamUrl, {
    method: c.req.method,
    headers,
    body: c.req.method !== 'GET' ? body : undefined,
  });

  const latencyMs = Date.now() - startTime;

  const basePipelineInput = {
    requestId,
    user,
    provider: 'openai' as const,
    model,
    body: parsedBody,
    latencyMs,
    sessionId,
    agentId,
    blocked: false,
    ...reqTelemetry,
  };

  if (reqTelemetry.isStreaming && upstreamResponse.body) {
    const { readable, usagePromise } = createStreamPassthrough(
      upstreamResponse.body,
      openaiProvider,
    );

    c.executionCtx.waitUntil(
      usagePromise.then((usage) =>
        runAsyncPipeline(c.env, { ...basePipelineInput, usage }),
      ),
    );

    return new Response(readable, {
      status: upstreamResponse.status,
      headers: upstreamResponse.headers,
    });
  }

  // Non-streaming response
  const responseBody = await upstreamResponse.text();
  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(responseBody);
  } catch {
    parsedResponse = {};
  }

  const usage = openaiProvider.extractUsage(parsedResponse);
  const resTelemetry = extractResponseTelemetry(parsedResponse, 'openai');

  c.executionCtx.waitUntil(
    runAsyncPipeline(c.env, {
      ...basePipelineInput,
      usage,
      cachedTokens: resTelemetry.cachedTokens,
      toolsUsed: resTelemetry.toolsUsed,
    }),
  );

  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: upstreamResponse.headers,
  });
});

export { openai };
