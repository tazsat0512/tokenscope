# TokenScope

AI agent token consumption proxy - visualize costs and auto-stop runaway agents.

## Quick Reference

```bash
# Install
pnpm install

# Test (proxy, 70 tests)
cd packages/proxy && npx vitest run

# Build shared package
cd packages/shared && pnpm build

# Lint
pnpm lint          # check
pnpm lint:fix      # auto-fix

# Type check
cd packages/proxy && npx tsc --noEmit
cd packages/dashboard && npx tsc --noEmit

# Dev (requires external accounts)
pnpm dev:proxy       # wrangler dev
pnpm dev:dashboard   # next dev
```

## Architecture

Monorepo with 3 packages:

- **`packages/shared`** — Types, pricing table (32 models), constants. Built with tsup.
- **`packages/proxy`** — Cloudflare Workers + Hono. Core proxy that forwards to OpenAI/Anthropic/Google, counts tokens, enforces budgets, detects loops.
- **`packages/dashboard`** — Next.js 15 + Clerk + tRPC + Recharts. Cost visualization and management UI.

## Key Patterns

- **Path-based routing**: `/openai/v1/*`, `/anthropic/v1/*`, `/google/v1beta/*`
- **Auth**: `Authorization: Bearer ts_...` → SHA-256 hash → KV lookup
- **Async pipeline**: `waitUntil()` for post-response DB writes, budget sync, loop detection
- **Budget state**: Cloudflare KV (sync reads <5ms), Turso (source of truth)
- **Loop detection**: Hash match (sync) + TF-IDF cosine similarity (async)
- **Anomaly detection**: EWMA with z-score threshold

## Testing

Tests are in `packages/proxy/test/`. Run with Vitest. Fixtures in `test/fixtures/`.

Key test files:
- `services/cost-calculator.test.ts` — Pricing for all models
- `services/budget-guard.test.ts` — Budget enforcement logic
- `services/loop-detector.test.ts` — Hash and cosine detection
- `services/anomaly-detector.test.ts` — EWMA convergence and spike detection
- `services/providers.test.ts` — Provider URL/header/usage extraction
- `routes/openai.test.ts` — Health, auth, 404, budget middleware
- `services/hash.test.ts` — SHA-256, prompt normalization
- `services/notifier.test.ts` — Slack notification format
