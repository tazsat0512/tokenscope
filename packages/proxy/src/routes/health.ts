import { Hono } from 'hono';
import type { Env } from '../types/index.js';

const health = new Hono<{ Bindings: Env }>();

health.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

export { health };
