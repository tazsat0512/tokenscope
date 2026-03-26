# Reivo

**Don't just watch your AI burn money. Stop it.**

Reivo is a transparent proxy that tracks AI agent costs in real-time, enforces budget limits, and auto-stops runaway loops. Works with OpenAI, Anthropic, and Google. One line change — that's it.

## Why

AI agents loop. A single stuck agent can burn $47,000 in 11 days. Existing tools either require code changes (AgentBudget) or only observe without stopping the bleed (Helicone, Langfuse).

Reivo is a proxy — change your base URL and it handles the rest. No SDK, no code changes, no vendor lock-in.

## Features

- **Smart Model Routing** — Automatically routes each request to the cheapest model that can handle it. Pure JSON analysis with 0ms overhead. See [How Smart Routing Works](#smart-routing) for details.
- **Cost Visibility** — Real-time cost tracking across OpenAI, Anthropic, and Google. Per-session, per-agent, and per-model breakdowns.
- **Budget Guardrails** — Set spending limits with alerts at 50%, 80%, and 100%. Requests are automatically blocked when exceeded.
- **Loop Detection** — Detects agents stuck in repetitive loops using prompt hashing and cosine similarity. Auto-stops runaway agents.
- **Anomaly Detection** — EWMA-based anomaly detection flags unusual spending patterns.
- **Slack Alerts** — Get notified for budget warnings, loop detection, and anomalies.
- **Streaming Support** — Full SSE passthrough with accurate token counting for all providers.

## Quick Start

### 1. Sign up

Create a free account at [app.reivo.dev](https://app.reivo.dev).

### 2. Generate an API key

Go to **Settings** and click "Generate API Key". Copy the key — it's only shown once.

### 3. Add your provider key

In **Settings**, add your OpenAI, Anthropic, or Google API key. You can add multiple keys per provider.

### 4. Change your base URL

```python
# Python — OpenAI
from openai import OpenAI
client = OpenAI(
    base_url="https://proxy.reivo.dev/openai/v1",
    api_key="rv_your_reivo_key"
)
```

```python
# Python — Anthropic
from anthropic import Anthropic
client = Anthropic(
    base_url="https://proxy.reivo.dev/anthropic/v1",
    api_key="rv_your_reivo_key"
)
```

```typescript
// TypeScript — OpenAI
const client = new OpenAI({
  baseURL: "https://proxy.reivo.dev/openai/v1",
  apiKey: "rv_your_reivo_key",
});
```

```bash
# curl — Google Gemini
curl https://proxy.reivo.dev/google/v1beta/models/gemini-2.5-flash:generateContent \
  -H "Authorization: Bearer rv_your_reivo_key" \
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

## Smart Routing

Reivo's Smart Router analyzes each request's JSON body and decides whether to downgrade the model — with zero latency overhead (pure JSON field inspection, no external API calls).

### Model Downgrade Map

| Provider | Requested Model | Routed To |
|----------|----------------|-----------|
| OpenAI | gpt-4o | gpt-4o-mini |
| OpenAI | gpt-4-turbo | gpt-4o-mini |
| OpenAI | o3 | o3-mini |
| Anthropic | claude-sonnet-4 | claude-haiku-4.5 |
| Anthropic | claude-opus-4 | claude-sonnet-4 |
| Google | gemini-2.5-pro | gemini-2.5-flash |

### Decision Logic

The router inspects 6 signals from the request body:

**Complexity signals (keep full model):**
- `tools` or `tool_choice` present → tool use requires full model
- `response_format.type = "json_schema"` → structured output requires full model
- `messages.length > 10` → deep conversation requires full model
- System prompt > 2,000 characters → complex instructions require full model

**Simplicity signals (eligible for downgrade):**
- `max_tokens < 100` → short output likely means simple task
- `temperature < 0.3` or unset → factual/deterministic query

### Routing Modes

| Mode | Behavior |
|------|----------|
| `conservative` (default) | Downgrade only when at least one simplicity signal is present AND no complexity signals |
| `aggressive` | Downgrade unless a complexity signal blocks it |
| `off` | Never downgrade — passthrough only |

### What Gets Logged

- The `model` field in the database always records the **original** requested model
- `routed_model` records what was actually sent upstream (only when different)
- `routing_reason` records why (e.g. `short_output_low_temp`, `tools_present`)

This lets you measure exact savings and audit every routing decision in the dashboard.

## Security

Reivo does **NOT** store:
- Your API keys (pass-through only)
- Prompt contents
- Response contents

Reivo **DOES** store:
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
Your App → Reivo Proxy (CF Workers) → LLM Provider (OpenAI/Anthropic/Google)
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

Reivo is fully open source. You can run the entire stack on your own infrastructure:

```bash
git clone https://github.com/tazsat/reivo.git
cd reivo
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

| Feature | Reivo | Helicone | Langfuse | AgentBudget |
|---------|-----------|----------|----------|-------------|
| Proxy-based (1 line change) | Yes | Yes | No (SDK) | No (library) |
| Smart model routing | **Yes** | No | No | No |
| Auto cost reduction | **40-60%** | No | No | No |
| Cost tracking & analytics | Yes | Yes | Yes | No |
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
