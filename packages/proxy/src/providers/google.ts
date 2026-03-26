import { PROVIDER_URLS, type Provider, type TokenUsage } from '@reivo/shared';

export const googleProvider: Provider = {
  name: 'google',

  extractModel(body: unknown): string {
    // Model is typically in the URL path for Google, not body
    // Will be overridden by route extraction
    const b = body as Record<string, unknown>;
    return (typeof b.model === 'string' ? b.model : 'unknown') as string;
  },

  extractUsage(body: unknown): TokenUsage {
    const b = body as Record<string, unknown>;
    const meta = b.usageMetadata as Record<string, number> | undefined;
    return {
      inputTokens: meta?.promptTokenCount ?? 0,
      outputTokens: meta?.candidatesTokenCount ?? 0,
    };
  },

  buildUpstreamUrl(path: string): string {
    const stripped = path.replace(/^\/google/, '');
    return `${PROVIDER_URLS.google}${stripped}`;
  },

  buildHeaders(providerKey: string, originalHeaders: Headers): Headers {
    const headers = new Headers();
    headers.set('Content-Type', originalHeaders.get('Content-Type') ?? 'application/json');
    headers.set('x-goog-api-key', providerKey);
    return headers;
  },

  parseStreamChunk(chunk: string): { done: boolean; usage?: TokenUsage } {
    try {
      const data = JSON.parse(chunk);
      if (data.usageMetadata) {
        return {
          done: false,
          usage: {
            inputTokens: data.usageMetadata.promptTokenCount ?? 0,
            outputTokens: data.usageMetadata.candidatesTokenCount ?? 0,
          },
        };
      }
      if (data.candidates?.[0]?.finishReason) {
        return { done: true };
      }
      return { done: false };
    } catch {
      return { done: false };
    }
  },
};
