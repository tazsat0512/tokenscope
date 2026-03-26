# Self-Hosting Reivo

## Prerequisites

- Node.js 20+
- pnpm 9+
- Cloudflare account (Workers + KV)
- Turso account (database)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/reivo.git
cd reivo
pnpm install
```

### 2. Create Turso database

```bash
turso db create reivo
turso db show reivo --url   # Copy TURSO_DATABASE_URL
turso db tokens create reivo  # Copy TURSO_AUTH_TOKEN
```

### 3. Configure Cloudflare KV

```bash
cd packages/proxy
npx wrangler kv:namespace create BUDGET_KV
npx wrangler kv:namespace create USERS_KV
```

Update `wrangler.toml` with the returned namespace IDs.

### 4. Set secrets

```bash
npx wrangler secret put TURSO_DATABASE_URL
npx wrangler secret put TURSO_AUTH_TOKEN
```

### 5. Run database migrations

```bash
pnpm db:generate
pnpm db:migrate
```

### 6. Deploy proxy

```bash
cd packages/proxy
npx wrangler deploy
```

### 7. Deploy dashboard (Vercel)

```bash
cd packages/dashboard
npx vercel deploy
```

Set environment variables in Vercel:
- `DATABASE_URL` - Turso URL
- `DATABASE_AUTH_TOKEN` - Turso token
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY` (optional)
- `STRIPE_WEBHOOK_SECRET` (optional)

## Architecture

```
Client → Reivo Proxy (CF Workers) → AI Provider (OpenAI/Anthropic/Google)
                ↓ (waitUntil)
           Async Pipeline
                ↓
          Turso DB ← Dashboard (Next.js)
```

The proxy adds <30ms overhead. Budget state is stored in Cloudflare KV for fast synchronous reads (<5ms). Turso is the source of truth, synced asynchronously.
