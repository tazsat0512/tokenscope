import { describe, expect, it } from 'vitest';
import { hashPrompt, normalizePrompt, sha256 } from '../../src/utils/hash.js';

describe('hash utils', () => {
  describe('sha256', () => {
    it('produces consistent 64-char hex hash', async () => {
      const hash = await sha256('hello');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);

      // Same input = same output
      const hash2 = await sha256('hello');
      expect(hash2).toBe(hash);
    });

    it('different inputs produce different hashes', async () => {
      const h1 = await sha256('hello');
      const h2 = await sha256('world');
      expect(h1).not.toBe(h2);
    });
  });

  describe('normalizePrompt', () => {
    it('lowercases text', () => {
      expect(normalizePrompt('Hello World')).toBe('hello world');
    });

    it('collapses whitespace', () => {
      expect(normalizePrompt('hello   world\n\nfoo')).toBe('hello world foo');
    });

    it('replaces UUIDs with placeholder', () => {
      const text = 'session 550e8400-e29b-41d4-a716-446655440000 started';
      expect(normalizePrompt(text)).toBe('session <UUID> started');
    });

    it('replaces long numbers with placeholder', () => {
      const text = 'timestamp 1711234567890 recorded';
      expect(normalizePrompt(text)).toBe('timestamp <TIMESTAMP> recorded');
    });
  });

  describe('hashPrompt', () => {
    it('extracts messages from OpenAI format', async () => {
      const body = {
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
        ],
      };
      const hash = await hashPrompt(body);
      expect(hash).toHaveLength(64);
    });

    it('extracts content from Anthropic multipart format', async () => {
      const body = {
        model: 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: [{ type: 'text', text: 'Hello' }] }],
      };
      const hash = await hashPrompt(body);
      expect(hash).toHaveLength(64);
    });

    it('extracts content from Google format', async () => {
      const body = {
        contents: [{ parts: [{ text: 'Hello' }] }],
      };
      const hash = await hashPrompt(body);
      expect(hash).toHaveLength(64);
    });

    it('same messages produce same hash', async () => {
      const body = {
        messages: [{ role: 'user', content: 'Hello world' }],
      };
      const h1 = await hashPrompt(body);
      const h2 = await hashPrompt(body);
      expect(h1).toBe(h2);
    });

    it('normalizes before hashing (UUID invariant)', async () => {
      const body1 = {
        messages: [{ role: 'user', content: 'session 550e8400-e29b-41d4-a716-446655440000' }],
      };
      const body2 = {
        messages: [{ role: 'user', content: 'session aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }],
      };
      const h1 = await hashPrompt(body1);
      const h2 = await hashPrompt(body2);
      expect(h1).toBe(h2);
    });
  });
});
