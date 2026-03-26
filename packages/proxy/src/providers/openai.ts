import { PROVIDER_URLS, type Provider, type TokenUsage } from '@reivo/shared';

export const openaiProvider: Provider = {
  name: 'openai',

  extractModel(body: unknown): string {
    const b = body as Record<string, unknown>;
    return (typeof b.model === 'string' ? b.model : 'unknown') as string;
  },

  extractUsage(body: unknown): TokenUsage {
    const b = body as Record<string, unknown>;
    const usage = b.usage as Record<string, number> | undefined;
    return {
      inputTokens: usage?.prompt_tokens ?? 0,
      outputTokens: usage?.completion_tokens ?? 0,
    };
  },

  buildUpstreamUrl(path: string): string {
    // path comes in as /openai/v1/chat/completions → strip /openai prefix
    const stripped = path.replace(/^\/openai/, '');
    return `${PROVIDER_URLS.openai}${stripped}`;
  },

  buildHeaders(providerKey: string, originalHeaders: Headers): Headers {
    const headers = new Headers(originalHeaders);
    headers.set('Authorization', `Bearer ${providerKey}`);
    // Remove reivo-specific headers
    headers.delete('x-session-id');
    headers.delete('x-agent-id');
    return headers;
  },

  parseStreamChunk(chunk: string): { done: boolean; usage?: TokenUsage } {
    try {
      const data = JSON.parse(chunk);
      if (data.usage) {
        return {
          done: false,
          usage: {
            inputTokens: data.usage.prompt_tokens ?? 0,
            outputTokens: data.usage.completion_tokens ?? 0,
          },
        };
      }
      if (data.choices?.[0]?.finish_reason) {
        return { done: true };
      }
      return { done: false };
    } catch {
      return { done: false };
    }
  },
};
