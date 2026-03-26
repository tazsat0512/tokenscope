import type { Provider, TokenUsage } from '@reivo/shared';

export interface StreamResult {
  readable: ReadableStream<Uint8Array>;
  usagePromise: Promise<TokenUsage>;
}

/**
 * Extract JSON payloads from a line of streamed data.
 *
 * - SSE format (OpenAI, Anthropic): lines prefixed with `data: `
 * - NDJSON / Google array format: bare JSON lines or `[{...},{...}]`
 */
function extractJsonPayloads(line: string, providerName: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  // SSE format: "data: ..."
  if (trimmed.startsWith('data: ')) {
    const payload = trimmed.slice(6);
    if (payload === '[DONE]') return [];
    return [payload];
  }

  // Google streams use bare JSON (sometimes wrapped in a JSON array with
  // leading/trailing brackets on separate lines).  Strip array delimiters
  // and try to parse what remains.
  if (providerName === 'google') {
    // Remove leading `[`, trailing `]`, or trailing commas left over from
    // the JSON-array envelope that Google uses for streamGenerateContent.
    const stripped = trimmed.replace(/^\[|\]$/g, '').replace(/,\s*$/, '').trim();
    if (stripped && stripped.startsWith('{')) {
      return [stripped];
    }
  }

  return [];
}

export function createStreamPassthrough(
  upstream: ReadableStream<Uint8Array>,
  provider: Provider,
): StreamResult {
  let resolveUsage: (usage: TokenUsage) => void;
  const usagePromise = new Promise<TokenUsage>((resolve) => {
    resolveUsage = resolve;
  });

  const decoder = new TextDecoder();
  let buffer = '';
  let fullBuffer = ''; // Keep full response for Google JSON array parsing
  let accumulatedUsage: TokenUsage = { inputTokens: 0, outputTokens: 0 };

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();

  const pump = async () => {
    const reader = upstream.getReader();
    const writer = writable.getWriter();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Forward chunk to client immediately
        await writer.write(value);

        // Parse for usage info
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        if (provider.name === 'google') fullBuffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const payloads = extractJsonPayloads(line, provider.name);
          for (const payload of payloads) {
            try {
              const parsed = provider.parseStreamChunk(payload);
              if (parsed.usage) {
                accumulatedUsage = {
                  inputTokens: parsed.usage.inputTokens || accumulatedUsage.inputTokens,
                  outputTokens: parsed.usage.outputTokens || accumulatedUsage.outputTokens,
                };
              }
            } catch {
              // Non-JSON line, skip
            }
          }
        }
      }
    } finally {
      // Google streams return a JSON array spanning multiple lines.
      // If line-by-line parsing didn't capture usage, parse the full buffer.
      if (provider.name === 'google' && accumulatedUsage.inputTokens === 0 && accumulatedUsage.outputTokens === 0) {
        // Google streams return a JSON array. fullBuffer contains the
        // complete response. Trim trailing whitespace/newlines.
        const combined = fullBuffer.trim();
        try {
          const arr = JSON.parse(combined);
          const items = Array.isArray(arr) ? arr : [arr];
          for (const item of items) {
            const parsed = provider.parseStreamChunk(JSON.stringify(item));
            if (parsed.usage) {
              accumulatedUsage = {
                inputTokens: parsed.usage.inputTokens || accumulatedUsage.inputTokens,
                outputTokens: parsed.usage.outputTokens || accumulatedUsage.outputTokens,
              };
            }
          }
        } catch {
          // Failed to parse full buffer
        }
      }
      resolveUsage(accumulatedUsage);
      await writer.close();
    }
  };

  pump().catch(() => resolveUsage(accumulatedUsage));

  return { readable, usagePromise };
}
