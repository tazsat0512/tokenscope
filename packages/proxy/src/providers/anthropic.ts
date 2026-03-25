import { PROVIDER_URLS, type Provider, type TokenUsage } from '@tokenscope/shared';

export const anthropicProvider: Provider = {
  name: 'anthropic',

  extractModel(body: unknown): string {
    const b = body as Record<string, unknown>;
    return (typeof b.model === 'string' ? b.model : 'unknown') as string;
  },

  extractUsage(body: unknown): TokenUsage {
    const b = body as Record<string, unknown>;
    const usage = b.usage as Record<string, number> | undefined;
    return {
      inputTokens: usage?.input_tokens ?? 0,
      outputTokens: usage?.output_tokens ?? 0,
    };
  },

  buildUpstreamUrl(path: string): string {
    const stripped = path.replace(/^\/anthropic/, '');
    return `${PROVIDER_URLS.anthropic}${stripped}`;
  },

  buildHeaders(providerKey: string, originalHeaders: Headers): Headers {
    const headers = new Headers(originalHeaders);
    headers.set('x-api-key', providerKey);
    headers.delete('Authorization');
    headers.delete('x-session-id');
    headers.delete('x-agent-id');
    // Preserve anthropic-version if present
    return headers;
  },

  parseStreamChunk(chunk: string): { done: boolean; usage?: TokenUsage } {
    try {
      const data = JSON.parse(chunk);
      if (data.type === 'message_delta' && data.usage) {
        return {
          done: false,
          usage: {
            inputTokens: 0,
            outputTokens: data.usage.output_tokens ?? 0,
          },
        };
      }
      if (data.type === 'message_start' && data.message?.usage) {
        return {
          done: false,
          usage: {
            inputTokens: data.message.usage.input_tokens ?? 0,
            outputTokens: 0,
          },
        };
      }
      if (data.type === 'message_stop') {
        return { done: true };
      }
      return { done: false };
    } catch {
      return { done: false };
    }
  },
};
