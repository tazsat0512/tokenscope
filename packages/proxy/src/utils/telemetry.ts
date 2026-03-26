import { hashPrompt } from './hash.js';

export interface RequestTelemetry {
  hasCacheControl: boolean;
  maxTokensSetting: number | undefined;
  isStreaming: boolean;
  toolCount: number;
  systemPromptHash: string | undefined;
}

export interface ResponseTelemetry {
  cachedTokens: number;
  toolsUsed: string[];
}

/**
 * Extract telemetry fields from the parsed request body.
 * Works across OpenAI, Anthropic, and Google request formats.
 */
export async function extractRequestTelemetry(body: unknown): Promise<RequestTelemetry> {
  const b = body as Record<string, unknown>;

  // hasCacheControl: Anthropic uses cache_control in messages/system
  const hasCacheControl = detectCacheControl(b);

  // max_tokens / max_completion_tokens
  const maxTokensSetting =
    typeof b.max_tokens === 'number'
      ? b.max_tokens
      : typeof b.max_completion_tokens === 'number'
        ? b.max_completion_tokens
        : undefined;

  // isStreaming
  const isStreaming = b.stream === true;

  // toolCount: OpenAI uses "tools" or "functions", Anthropic uses "tools"
  const tools = Array.isArray(b.tools) ? b.tools : [];
  const functions = Array.isArray(b.functions) ? b.functions : [];
  const toolCount = tools.length + functions.length;

  // systemPromptHash: extract system message and hash separately
  const systemPromptHash = await extractAndHashSystemPrompt(b);

  return {
    hasCacheControl,
    maxTokensSetting,
    isStreaming,
    toolCount,
    systemPromptHash,
  };
}

/**
 * Extract telemetry fields from the parsed response body.
 */
export function extractResponseTelemetry(body: unknown, provider: string): ResponseTelemetry {
  const b = body as Record<string, unknown>;
  let cachedTokens = 0;
  const toolsUsed: string[] = [];

  if (provider === 'openai') {
    // OpenAI: usage.prompt_tokens_details.cached_tokens
    const usage = b.usage as Record<string, unknown> | undefined;
    const details = usage?.prompt_tokens_details as Record<string, unknown> | undefined;
    if (typeof details?.cached_tokens === 'number') {
      cachedTokens = details.cached_tokens;
    }
    // OpenAI: choices[].message.tool_calls[].function.name
    const choices = Array.isArray(b.choices) ? b.choices : [];
    for (const choice of choices) {
      const msg = (choice as Record<string, unknown>).message as
        | Record<string, unknown>
        | undefined;
      const calls = Array.isArray(msg?.tool_calls) ? msg.tool_calls : [];
      for (const call of calls) {
        const fn = (call as Record<string, unknown>).function as
          | Record<string, unknown>
          | undefined;
        if (typeof fn?.name === 'string') toolsUsed.push(fn.name);
      }
    }
  } else if (provider === 'anthropic') {
    // Anthropic: usage.cache_read_input_tokens
    const usage = b.usage as Record<string, unknown> | undefined;
    if (typeof usage?.cache_read_input_tokens === 'number') {
      cachedTokens = usage.cache_read_input_tokens;
    }
    // Anthropic: content[].type === "tool_use" → content[].name
    const content = Array.isArray(b.content) ? b.content : [];
    for (const block of content) {
      const item = block as Record<string, unknown>;
      if (item.type === 'tool_use' && typeof item.name === 'string') {
        toolsUsed.push(item.name);
      }
    }
  } else if (provider === 'google') {
    // Google: usageMetadata.cachedContentTokenCount
    const meta = b.usageMetadata as Record<string, unknown> | undefined;
    if (typeof meta?.cachedContentTokenCount === 'number') {
      cachedTokens = meta.cachedContentTokenCount;
    }
    // Google: candidates[].content.parts[].functionCall.name
    const candidates = Array.isArray(b.candidates) ? b.candidates : [];
    for (const cand of candidates) {
      const content = (cand as Record<string, unknown>).content as
        | Record<string, unknown>
        | undefined;
      const parts = Array.isArray(content?.parts) ? content.parts : [];
      for (const part of parts) {
        const fc = (part as Record<string, unknown>).functionCall as
          | Record<string, unknown>
          | undefined;
        if (typeof fc?.name === 'string') toolsUsed.push(fc.name);
      }
    }
  }

  return { cachedTokens, toolsUsed };
}

function detectCacheControl(body: Record<string, unknown>): boolean {
  const json = JSON.stringify(body);
  return json.includes('"cache_control"');
}

async function extractAndHashSystemPrompt(
  body: Record<string, unknown>,
): Promise<string | undefined> {
  // OpenAI format: messages[0].role === "system"
  const messages = Array.isArray(body.messages) ? body.messages : [];
  for (const msg of messages) {
    const m = msg as Record<string, unknown>;
    if (m.role === 'system') {
      const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return hashPrompt(content);
    }
  }

  // Anthropic format: system field (string or array)
  if (body.system) {
    const content = typeof body.system === 'string' ? body.system : JSON.stringify(body.system);
    return hashPrompt(content);
  }

  // Google format: systemInstruction.parts[].text
  const si = body.systemInstruction as Record<string, unknown> | undefined;
  if (si) {
    const parts = Array.isArray(si.parts) ? si.parts : [];
    const texts = parts.map((p) => (p as Record<string, unknown>).text ?? '').join('');
    if (texts) return hashPrompt(texts);
  }

  return undefined;
}
