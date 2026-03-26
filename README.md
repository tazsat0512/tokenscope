# TokenScope

**Don't just watch your AI burn money. Stop it.**

TokenScope is a transparent proxy that tracks AI agent costs in real-time, enforces budget limits, and auto-stops runaway loops. Works with OpenAI, Anthropic, and Google. One line change — that's it.

## Why

AI agents loop. A single stuck agent can burn $47,000 in 11 days. Existing tools either require code changes (AgentBudget) or only observe without stopping the bleed (Helicone, Langfuse).

TokenScope is a proxy — change your base URL and it handles the rest. No SDK, no code changes, no vendor lock-in.

## Features

- **Cost Visibility** — Real-time cost tracking across OpenAI, Anthropic, and Google. Per-session, per-agent, and per-model breakdowns.
- **Budget Guardrails** — Set spending limits with alerts at 50%, 80%, and 100%. Requests are automatically blocked when exceeded.
- **Loop Detection** — Detects agents stuck in repetitive loops using prompt hashing and cosine similarity. Auto-stops runaway agents.
- **Anomaly Detection** — EWMA-based anomaly detection flags unusual spending patterns.
- **Slack Alerts** — Get notified for budget warnings, loop detection, and anomalies.
- **Streaming Support** — Full SSE passthrough with accurate token counting for all providers.

## Quick Start

### 1. Sign up

Create a free account at [tokenscope-amber.vercel.app](https://tokenscope-amber.vercel.app).

### 2. Generate an API key

Go to **Settings** and click "Generate API Key". Copy the key — it's only shown once.

### 3. Add your provider key

In **Settings**, add your OpenAI, Anthropic, or Google API key. You can add multiple keys per provider.

### 4. Change your base URL

```python
# Python — OpenAI
from openai import OpenAI
client = OpenAI(
    base_url="https://tokenscope-proxy.tazoelab.workers.dev/openai/v1",
    api_key="ts_your_tokenscope_key"
)
```

```python
# Python — Anthropic
from anthropic import Anthropic
client = Anthropic(
    base_url="https://tokenscope-proxy.tazoelab.workers.dev/anthropic/v1",
    api_key="ts_your_tokenscope_key"
)
```

```typescript
// TypeScript — OpenAI
const client = new OpenAI({
  baseURL: "https://tokenscope-proxy.tazoelab.workers.dev/openai/v1",
  apiKey: "ts_your_tokenscope_key",
});
```

```bash
# curl — Google Gemini
curl https://tokenscope-proxy.tazoelab.workers.dev/google/v1beta/models/gemini-2.5-flash:generateContent \
  -H "Authorization: Bearer ts_your_tokenscope_key" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Supported Providers

| Provider | Base URL | Streaming |
|----------|----------|-----------|
| OpenAI | `.../openai/v1` | Yes |
| Anthropic | `.../anthropic/v1` | Yes |
| Google | `.../google/v1beta` | Yes |

### Custom Headers

| Header | Description |
|--------|-------------|
| `X-Session-Id` | Group requests by session |
| `X-Agent-Id` | Track costs per agent |

## Security

TokenScope does **NOT** store:
- Your API keys (pass-through only)
- Prompt contents
- Response contents

TokenScope **DOES** store:
- Model name, token count, cost
- Timestamp, session ID, agent ID
- Prompt hash (for loop detection, not reversible)

**Your API keys are forwarded directly to the LLM provider and never touch our database.** We see them in transit (like any proxy) but do not persist them. The proxy runs on Cloudflare Workers, which are stateless — after request processing, memory is discarded. Data is only persisted if explicitly written to our database, and we only write metadata.

For maximum security, use our **self-hosted OSS version** where all data stays on your infrastructure.

### Trust Model

| Level | What | Status |
|-------|------|--------|
| **OSS Transparency** | Code is open — verify what we store yourself | Available now |
| **Stateless Proxy** | Cloudflare Workers discard memory after each request | Available now |
| **Self-Host Option** | Run everything on your own infra | Available now |
| **SOC2 Compliance** | Third-party audit of security practices | Planned |

## Architecture

```
Your App → TokenScope Proxy (CF Workers) → LLM Provider (OpenAI/Anthropic/Google)
                    ↓
             Turso DB (metadata only)
                    ↓
             Dashboard (Next.js on Vercel)
```

| Component | Technology | Why |
|-----------|-----------|-----|
| Proxy | Cloudflare Workers + Hono | Edge-deployed, <30ms overhead, stateless |
| Database | Turso (libSQL) | Metadata only — model, tokens, cost, timestamp, hash |
| Dashboard | Next.js 15 + shadcn/ui | Real-time cost visualization |
| Auth | Clerk | Pre-built auth UI |
| Payments | Stripe | Free + Pro plans |
| Notifications | Slack Webhook | Budget, loop, and anomaly alerts |

**What goes in the database:** model name, token counts, cost, latency, timestamp, session/agent IDs, prompt hash, telemetry flags (streaming, tool usage, cache hits).

**What never goes in the database:** API keys, prompts, responses, any user content.

## Dashboard Pages

- **Overview** — Cost trends, daily breakdown, summary stats
- **Sessions** — Request timeline grouped by session
- **Agents** — Cost breakdown per agent and per model
- **Loops** — History of detected loops with match details
- **Settings** — API key management, provider keys, budget limits, Slack webhook
- **Billing** — Usage tracking and plan management

## Self-Hosting

TokenScope is fully open source. You can run the entire stack on your own infrastructure:

```bash
git clone https://github.com/tazsat/tokenscope.git
cd tokenscope
pnpm install
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup instructions.

### Requirements

- Node.js >= 20
- pnpm
- Cloudflare account (Workers + KV)
- Turso database
- Clerk account (auth)

## Pricing

| Plan | Price | Requests/month |
|------|-------|---------------|
| Free | $0 | 10,000 |
| Pro | $49/mo | 100,000 |
| Self-Host | Free forever | Unlimited |

## Comparison

| Feature | TokenScope | Helicone | Langfuse | AgentBudget |
|---------|-----------|----------|----------|-------------|
| Proxy-based (1 line change) | Yes | Yes | No (SDK) | No (library) |
| Budget enforcement | Yes | No | No | Yes |
| Loop detection | Yes | No | No | No |
| Anomaly detection | Yes | No | No | No |
| Auto-stop runaway agents | Yes | No | No | Partial |
| Self-host OSS | Yes | Yes | Yes | N/A |
| Streaming support | Yes | Yes | Yes | N/A |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## License

[MIT](LICENSE)
