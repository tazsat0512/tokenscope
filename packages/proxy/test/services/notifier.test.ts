import { describe, it, expect, vi } from 'vitest';
import { sendSlackNotification } from '../../src/services/notifier.js';
import type { AlertPayload } from '@tokenscope/shared';

describe('notifier', () => {
  it('sends Slack notification with correct format', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', mockFetch);

    const alert: AlertPayload = {
      type: 'budget_warning',
      userId: 'user-1',
      message: 'Budget at 80%',
      details: { Used: '$8.00', Limit: '$10.00' },
      timestamp: Date.now(),
    };

    await sendSlackNotification('https://hooks.slack.com/test', alert);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://hooks.slack.com/test');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body);
    expect(body.blocks).toBeDefined();
    expect(body.blocks.length).toBeGreaterThan(0);
    expect(body.blocks[0].type).toBe('header');

    vi.unstubAllGlobals();
  });

  it('includes alert type in header', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', mockFetch);

    const alert: AlertPayload = {
      type: 'loop_detected',
      userId: 'user-1',
      message: 'Loop detected',
      details: {},
      timestamp: Date.now(),
    };

    await sendSlackNotification('https://hooks.slack.com/test', alert);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.blocks[0].text.text).toContain('Loop Detected');

    vi.unstubAllGlobals();
  });
});
