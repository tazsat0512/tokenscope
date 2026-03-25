import type { Provider, TokenUsage } from '@tokenscope/shared';

export interface StreamResult {
  readable: ReadableStream<Uint8Array>;
  usagePromise: Promise<TokenUsage>;
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
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
          try {
            const parsed = provider.parseStreamChunk(line.slice(6));
            if (parsed.usage) {
              accumulatedUsage = parsed.usage;
            }
          } catch {
            // Non-JSON line, skip
          }
        }
      }
    } finally {
      resolveUsage(accumulatedUsage);
      await writer.close();
    }
  };

  pump().catch(() => resolveUsage(accumulatedUsage));

  return { readable, usagePromise };
}
