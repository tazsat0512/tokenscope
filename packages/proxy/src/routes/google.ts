import { HEADER_AGENT_ID } from '@reivo/shared';
import { Hono } from 'hono';
import { runAsyncPipeline } from '../async/pipeline.js';
import { googleProvider } from '../providers/google.js';
import type { Env, UserRecord } from '../types/index.js';
import { fetchUpstream } from '../utils/error.js';
import { resolveSessionId } from '../utils/session.js';
import { createStreamPassthrough } from '../utils/streaming.js';
import { extractRequestTelemetry, extractResponseTelemetry } from '../utils/telemetry.js';

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
  const sessionId = await resolveSessionId(c, user.id);
  const agentId = c.req.header(HEADER_AGENT_ID) ?? null;

  const providerKey = user.providerKeys.google;
  if (!providerKey) {
    return c.json({ error: 'no_provider_key', message: 'No Google API key configured', request_id: requestId }, 400);
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

  const reqTelemetry = await extractRequestTelemetry(parsedBody);
  // Google streaming is determined by URL path, not body field
  const isStream = c.req.path.includes('streamGenerateContent');
  reqTelemetry.isStreaming = isStream;

  const headers = googleProvider.buildHeaders(providerKey, c.req.raw.headers);

  const result = await fetchUpstream(
    upstreamUrl,
    { method: c.req.method, headers, body: c.req.method !== 'GET' ? body : undefined },
    c,
    requestId,
  );

  if ('error' in result) return result.response;
  const upstreamResponse = result;

  const latencyMs = Date.now() - startTime;

  const basePipelineInput = {
    requestId,
    user,
    provider: 'google' as const,
    model,
    body: parsedBody,
    latencyMs,
    sessionId,
    agentId,
    blocked: !upstreamResponse.ok,
    blockReason: upstreamResponse.ok ? undefined : `upstream_${upstreamResponse.status}`,
    ...reqTelemetry,
  };

  if (isStream && upstreamResponse.body) {
    const { readable, usagePromise } = createStreamPassthrough(
      upstreamResponse.body,
      googleProvider,
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

  const responseBody = await upstreamResponse.text();
  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(responseBody);
  } catch {
    parsedResponse = {};
  }

  const usage = googleProvider.extractUsage(parsedResponse);
  const resTelemetry = extractResponseTelemetry(parsedResponse, 'google');

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

export { google };
