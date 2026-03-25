import { describe, expect, it } from 'vitest';
import { anthropicProvider } from '../../src/providers/anthropic.js';
import { googleProvider } from '../../src/providers/google.js';
import { openaiProvider } from '../../src/providers/openai.js';
import anthropicResponse from '../fixtures/anthropic-message-response.json';
import anthropicStreamChunks from '../fixtures/anthropic-stream-chunks.json';
import googleResponse from '../fixtures/google-generate-response.json';
import googleStreamChunks from '../fixtures/google-stream-chunks.json';
import openaiResponse from '../fixtures/openai-chat-response.json';
import openaiStreamChunks from '../fixtures/openai-stream-chunks.json';

describe('OpenAI provider', () => {
  it('extracts model from request body', () => {
    expect(openaiProvider.extractModel({ model: 'gpt-4o' })).toBe('gpt-4o');
    expect(openaiProvider.extractModel({ model: 'gpt-4o-mini' })).toBe('gpt-4o-mini');
    expect(openaiProvider.extractModel({})).toBe('unknown');
  });

  it('extracts usage from response', () => {
    const usage = openaiProvider.extractUsage(openaiResponse);
    expect(usage.inputTokens).toBe(12);
    expect(usage.outputTokens).toBe(9);
  });

  it('handles missing usage gracefully', () => {
    const usage = openaiProvider.extractUsage({});
    expect(usage.inputTokens).toBe(0);
    expect(usage.outputTokens).toBe(0);
  });

  it('builds correct upstream URL', () => {
    expect(openaiProvider.buildUpstreamUrl('/openai/v1/chat/completions')).toBe(
      'https://api.openai.com/v1/chat/completions',
    );
    expect(openaiProvider.buildUpstreamUrl('/openai/v1/embeddings')).toBe(
      'https://api.openai.com/v1/embeddings',
    );
  });

  it('builds headers with Bearer token', () => {
    const original = new Headers({ 'Content-Type': 'application/json', 'x-session-id': 'sess-1' });
    const headers = openaiProvider.buildHeaders('sk-test-key', original);
    expect(headers.get('Authorization')).toBe('Bearer sk-test-key');
    expect(headers.get('x-session-id')).toBeNull(); // stripped
  });

  it('parses stream chunks correctly', () => {
    for (const chunk of openaiStreamChunks) {
      if ((chunk as { skip?: boolean }).skip) continue;
      const parsed = openaiProvider.parseStreamChunk(chunk.raw.replace('data: ', ''));
      expect(parsed.done).toBe(chunk.expected.done);
      if (chunk.expected.usage) {
        expect(parsed.usage).toEqual(chunk.expected.usage);
      }
    }
  });
});

describe('Anthropic provider', () => {
  it('extracts model from request body', () => {
    expect(anthropicProvider.extractModel({ model: 'claude-3-5-sonnet-20241022' })).toBe(
      'claude-3-5-sonnet-20241022',
    );
  });

  it('extracts usage from response', () => {
    const usage = anthropicProvider.extractUsage(anthropicResponse);
    expect(usage.inputTokens).toBe(15);
    expect(usage.outputTokens).toBe(10);
  });

  it('builds correct upstream URL', () => {
    expect(anthropicProvider.buildUpstreamUrl('/anthropic/v1/messages')).toBe(
      'https://api.anthropic.com/v1/messages',
    );
  });

  it('builds headers with x-api-key', () => {
    const original = new Headers({
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      Authorization: 'Bearer ts_xxx',
    });
    const headers = anthropicProvider.buildHeaders('sk-ant-test', original);
    expect(headers.get('x-api-key')).toBe('sk-ant-test');
    expect(headers.get('Authorization')).toBeNull(); // stripped
    expect(headers.get('anthropic-version')).toBe('2023-06-01'); // preserved
  });

  it('parses stream chunks correctly', () => {
    for (const chunk of anthropicStreamChunks) {
      const parsed = anthropicProvider.parseStreamChunk(chunk.data);
      expect(parsed.done).toBe(chunk.expected.done);
      if (chunk.expected.usage) {
        expect(parsed.usage).toEqual(chunk.expected.usage);
      }
    }
  });
});

describe('Google provider', () => {
  it('extracts usage from response', () => {
    const usage = googleProvider.extractUsage(googleResponse);
    expect(usage.inputTokens).toBe(8);
    expect(usage.outputTokens).toBe(11);
  });

  it('builds correct upstream URL', () => {
    expect(
      googleProvider.buildUpstreamUrl('/google/v1beta/models/gemini-2.0-flash:generateContent'),
    ).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    );
  });

  it('builds headers with x-goog-api-key', () => {
    const original = new Headers({ 'Content-Type': 'application/json' });
    const headers = googleProvider.buildHeaders('AIza-test-key', original);
    expect(headers.get('x-goog-api-key')).toBe('AIza-test-key');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('parses stream chunks correctly', () => {
    for (const chunk of googleStreamChunks) {
      const parsed = googleProvider.parseStreamChunk(chunk.raw);
      if (chunk.expected.done !== undefined) {
        // Google chunk with finishReason triggers done
        if (chunk.expected.usage) {
          expect(parsed.usage).toEqual(chunk.expected.usage);
        }
      }
    }
  });
});
