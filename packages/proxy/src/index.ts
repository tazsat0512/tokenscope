import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth.js';
import { budgetGuardMiddleware } from './middleware/budget-guard.js';
import { planGuardMiddleware } from './middleware/plan-guard.js';
import { requestLoggerMiddleware } from './middleware/request-logger.js';
import { anthropic } from './routes/anthropic.js';
import { google } from './routes/google.js';
import { health } from './routes/health.js';
import { openai } from './routes/openai.js';
import type { Env, UserRecord } from './types/index.js';

type HonoEnv = {
  Bindings: Env;
  Variables: {
    user: UserRecord;
    requestId: string;
    startTime: number;
    budgetAlert?: boolean;
    forceAggressiveRouting?: boolean;
  };
};

const app = new Hono<HonoEnv>();

// Global middleware
app.use('*', cors());
app.use('*', logger());

// Health check (no auth required)
app.route('/', health);

// Auth + plan guard + budget guard for proxy routes
app.use(
  '/openai/*',
  requestLoggerMiddleware,
  authMiddleware,
  planGuardMiddleware,
  budgetGuardMiddleware,
);
app.use(
  '/anthropic/*',
  requestLoggerMiddleware,
  authMiddleware,
  planGuardMiddleware,
  budgetGuardMiddleware,
);
app.use(
  '/google/*',
  requestLoggerMiddleware,
  authMiddleware,
  planGuardMiddleware,
  budgetGuardMiddleware,
);

// Provider routes
app.route('/', openai);
app.route('/', anthropic);
app.route('/', google);

// 404 fallback
app.notFound((c) => {
  return c.json(
    {
      error: 'Not found',
      message: 'Use /openai/*, /anthropic/*, or /google/* to proxy requests',
    },
    404,
  );
});

// Error handler
app.onError((err, c) => {
  const requestId = c.get('requestId' as never) ?? 'unknown';
  console.error(`[${requestId}] Unhandled error:`, err);
  return c.json({ error: 'internal_error', message: err.message, request_id: requestId }, 500);
});

export default app;
