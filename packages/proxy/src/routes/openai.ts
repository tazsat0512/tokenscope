import { HEADER_AGENT_ID } from '@reivo/shared';
import { Hono } from 'hono';
import { runAsyncPipeline } from '../async/pipeline.js';
import { openaiProvider } from '../providers/openai.js';
import type { Env, UserRecord } from '../types/index.js';
import { fetchUpstream } from '../utils/error.js';
import { resolveSessionId } from '../utils/session.js';
import { createStreamPassthrough } from '../utils/streaming.js';
import { routeModel } from '../services/router.js';
import { extractRequestTelemetry, extractResponseTelemetry } from '../utils/telemetry.js';

type HonoEnv = {
  Bindings: Env;
  Variables: { user: UserRecord; requestId: string; startTime: number; budgetAlert?: boolean; forceAggressiveRouting?: boolean };
};

const openai = new Hono<HonoEnv>();

openai.all('/openai/*', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const startTime = c.get('startTime');
  const sessionId = await resolveSessionId(c, user.id);
  const agentId = c.req.header(HEADER_AGENT_ID) ?? null;

  const providerKey = user.providerKeys.openai;
  if (!providerKey) {
    return c.json({ error: 'no_provider_key', message: 'No OpenAI API key configured', request_id: requestId }, 400);
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

  // Smart routing: potentially downgrade model
  const forceAggressive = c.get('forceAggressiveRouting');
  const routing = routeModel(parsedBody, 'openai', model, user, forceAggressive);
  if (routing.routedModel !== model && parsedBody && typeof parsedBody === 'object') {
    (parsedBody as Record<string, unknown>).model = routing.routedModel;
  }

  const headers = openaiProvider.buildHeaders(providerKey, c.req.raw.headers);
  headers.set('Content-Type', 'application/json');

  // When the request is streaming, inject stream_options to ensure OpenAI
  // returns a final chunk containing token usage data.
  let upstreamBody: string;
  if (reqTelemetry.isStreaming && parsedBody && typeof parsedBody === 'object') {
    const patched = { ...(parsedBody as Record<string, unknown>) };
    const existingOpts = (patched.stream_options ?? {}) as Record<string, unknown>;
    patched.stream_options = { ...existingOpts, include_usage: true };
    upstreamBody = JSON.stringify(patched);
  } else if (routing.routedModel !== model) {
    upstreamBody = JSON.stringify(parsedBody);
  } else {
    upstreamBody = body;
  }

  const result = await fetchUpstream(
    upstreamUrl,
    { method: c.req.method, headers, body: c.req.method !== 'GET' ? upstreamBody : undefined },
    c,
    requestId,
  );

  if ('error' in result) return result.response;
  const upstreamResponse = result;

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
    blocked: !upstreamResponse.ok,
    blockReason: upstreamResponse.ok ? undefined : `upstream_${upstreamResponse.status}`,
    routedModel: routing.routedModel !== routing.originalModel ? routing.routedModel : undefined,
    routingReason: routing.routedModel !== routing.originalModel ? routing.reason : undefined,
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
