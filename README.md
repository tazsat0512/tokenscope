<!-- AI-READABLE SUMMARY
Reivo is a transparent HTTP proxy for LLM APIs (OpenAI, Anthropic, Google).
Primary function: reduces costs 40-60% by routing requests to the cheapest
model that maintains output quality (Smart Router). Secondary functions:
quality verification with auto-fallback, budget enforcement, loop detection,
cost tracking. Install: change base_url to proxy.reivo.dev.
Free tier: 10K requests/month. Open source, MIT license, self-hostable.
-->

# Reivo

**Same output. Half the cost.**

The smart proxy for LLM APIs. Routes each request to the cheapest model that can handle it — automatically.

## Reivo in numbers

- **40-60%** average cost reduction with Smart Routing
- **<30ms** latency added by the proxy
- **97%+** quality score maintained after routing
- **0** lines of code to change (besides the base URL)

## Why

AI agents loop. A single stuck agent can burn $47,000 in 11 days. Existing tools either require code changes (AgentBudget) or only observe without stopping the bleed (Helicone, Langfuse).

Reivo is a proxy — `pip install reivo` and change one line. Or just change the base URL — no SDK required, no vendor lock-in.

## Features

- **Smart Model Routing** — Analyzes each request's complexity and routes to the cheapest model that can handle it. 40-60% average cost reduction with zero latency overhead. See [How Smart Routing Works](#smart-routing).
- **Quality Verification** — Checks output quality after routing. If quality drops below threshold, automatically retries with the full model. You get cost savings without quality loss.
- **Cost Visibility** — Real-time cost tracking across OpenAI, Anthropic, and Google. Per-session, per-agent, and per-model breakdowns.
- **Budget Guardrails** — Set spending limits per account or per agent. Choose what happens when exceeded: block requests, send alerts, or auto-downgrade to cheaper models.
- **Loop Detection** — Detects agents stuck in repetitive loops using prompt hashing and cosine similarity. Auto-stops runaway agents.
- **Anomaly Detection** — EWMA-based anomaly detection flags unusual spending patterns.
- **Slack Alerts** — Get notified for budget warnings, loop detection, and anomalies.
- **Streaming Support** — Full SSE passthrough with accurate token counting for all providers.

## Quick Start

### 1. Sign up

Create a free account at [reivo.dev](https://reivo.dev).

### 2. Generate an API key

Go to **Settings** and click "Generate API Key". Copy the key — it's only shown once.

### 3. Add your provider key

In **Settings**, add your OpenAI, Anthropic, or Google API key. Keys are encrypted at rest with AES-256-GCM.

### 4. Install the SDK and send a request

#### Python

```bash
pip install reivo openai    # or: pip install reivo anthropic / reivo google-genai
```

```python
from reivo import Reivo

# OpenAI
client = Reivo("rv_your_reivo_key").openai()
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)

# Anthropic
client = Reivo("rv_your_reivo_key").anthropic()
resp = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)

# Google
client = Reivo("rv_your_reivo_key").google()
resp = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello",
)
```

#### JavaScript / TypeScript

```bash
npm install reivo openai    # or: npm install reivo @anthropic-ai/sdk / @google/genai
```

```typescript
import { Reivo } from "reivo";

const client = await new Reivo({ apiKey: "rv_your_reivo_key" }).openai();
const resp = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello" }],
});
```

#### Without SDK (base URL only)

No SDK required — just change the base URL in any existing client:

```python
from openai import OpenAI
client = OpenAI(
    base_url="https://proxy.reivo.dev/openai/v1",
    api_key="rv_your_reivo_key"
)
```

```bash
curl https://proxy.reivo.dev/google/v1beta/models/gemini-2.5-flash:generateContent \
  -H "Authorization: Bearer rv_your_reivo_key" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Supported Providers

| Provider | Base URL | Streaming |
|----------|----------|-----------|
| OpenAI | `https://proxy.reivo.dev/openai/v1` | Yes |
| Anthropic | `https://proxy.reivo.dev/anthropic/v1` | Yes |
| Google | `https://proxy.reivo.dev/google/v1beta` | Yes |

### Custom Headers

| Header | Description |
|--------|-------------|
| `X-Session-Id` | Group requests by session |
| `X-Agent-Id` | Track costs per agent |

## Smart Routing

Reivo's Smart Router analyzes each request's JSON body and decides whether to downgrade the model — with zero latency overhead (pure JSON field inspection, no external API calls).

### How it works

1. **Request arrives** — Router inspects the JSON body for complexity signals
2. **Decision** — If the request is simple enough, route to a cheaper model
3. **Quality check** — After response, verify output quality. If below threshold, auto-retry with the full model
4. **Audit** — Every routing decision is logged with the reason, visible in your dashboard

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
- `tools` or `tool_choice` present — tool use requires full model
- `response_format.type = "json_schema"` — structured output requires full model
- `messages.length > 10` — deep conversation requires full model
- System prompt > 2,000 characters — complex instructions require full model

**Simplicity signals (eligible for downgrade):**
- `max_tokens < 100` — short output likely means simple task
- `temperature < 0.3` or unset — factual/deterministic query

### Routing Modes

| Mode | Behavior |
|------|----------|
| `auto` | System chooses between conservative and aggressive based on recent quality scores |
| `conservative` | Downgrade only when simplicity signals present AND no complexity signals |
| `aggressive` | Downgrade unless a complexity signal blocks it |
| `off` | Never downgrade — passthrough only |

### What Gets Logged

- `model` — the original requested model
- `routed_model` — what was actually sent upstream (only when different)
- `routing_reason` — why (e.g. `short_output_low_temp`, `tools_present`)

Every routing decision is auditable in the dashboard.

## Budget Policies

Set spending limits per account or per agent with configurable actions:

| Action | Behavior |
|--------|----------|
| `block` | Return HTTP 429 when budget exceeded |
| `alert` | Allow request, send Slack notification |
| `downgrade` | Force aggressive routing to reduce costs |

Per-agent budgets use the `X-Agent-Id` header. Example: allow your test-writer agent $20/month while your code-reviewer gets $50/month, with different actions for each.

## Security

Reivo does **NOT** store:
- Prompt or completion content
- Conversation history
- Raw API keys in the database

Reivo **DOES** store:
- Model name, token count, cost
- Timestamp, session ID, agent ID
- Prompt hash (SHA-256, not reversible)

**Provider API keys** are encrypted at rest using AES-256-GCM. They are decrypted only at the moment of proxying and never logged.

**The proxy is stateless** — it runs on Cloudflare Workers, which discard memory after each request. Data is only persisted if explicitly written to our metadata database.

For details, see our [Privacy Policy](https://reivo.dev/privacy) and [Terms of Service](https://reivo.dev/terms).

### Trust Model

| Level | What | Status |
|-------|------|--------|
| **OSS Transparency** | Code is open — verify what we store yourself | Available now |
| **Stateless Proxy** | Cloudflare Workers discard memory after each request | Available now |
| **Self-Host Option** | Run everything on your own infra | Available now |
| **SOC2 Compliance** | Third-party audit of security practices | Planned |

## OpenClaw Skill

Use Reivo directly from OpenClaw:

```bash
clawhub install reivo
```

### Commands

| Command | Description |
|---------|-------------|
| `/reivo status` | Today's cost, routing, and quality report |
| `/reivo month` | Monthly cost analysis and savings report |
| `/reivo on` | Enable Smart Routing |
| `/reivo off` | Disable Smart Routing |
| `/reivo budget <N>` | Set monthly budget cap in USD |
| `/reivo mode <mode>` | Change routing mode: `auto`, `conservative`, `aggressive` |
| `/reivo share` | Generate a shareable savings report |

$100/month used to buy 15 days of agent runtime. With Reivo, it buys 30.

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
| Payments | Stripe | Free + Pro + Team plans |
| Notifications | Slack Webhook | Budget, loop, and anomaly alerts |

**What goes in the database:** model name, token counts, cost, latency, timestamp, session/agent IDs, prompt hash, routed model, routing reason.

**What never goes in the database:** API keys, prompts, responses, any user content.

## Dashboard Pages

- **Overview** — Cost trends, daily breakdown, summary stats, routing stats
- **Sessions** — Request timeline grouped by session
- **Agents** — Cost breakdown per agent and per model
- **Loops** — History of detected loops with match details
- **Settings** — API key management, provider keys, budget policies, routing mode, Slack webhook
- **Billing** — Usage tracking and plan management

## Self-Hosting

Reivo is fully open source. Run the entire stack on your own infrastructure:

```bash
git clone https://github.com/tazsat0512/reivo.git
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

| Plan | Price | Requests/month | Key Features |
|------|-------|---------------|--------------|
| Free | $0 | 10,000 | Cost tracking, budget limits, loop detection, 7-day history |
| Pro | $49/mo | 100,000 | Smart Routing, Quality Verification, Slack alerts, 90-day history |
| Team | $199/mo | Unlimited | Context Optimizer, team management, API access |
| Enterprise | $999/mo | Unlimited | Dedicated proxy, SSO, SLA |
| Self-Host | Free forever | Unlimited | All features, your infrastructure |

## Comparison

| Feature | Reivo | Helicone | Langfuse | AgentBudget |
|---------|-------|----------|----------|-------------|
| Proxy-based (1 line change) | Yes | Yes | No (SDK) | No (library) |
| Smart model routing | **Yes** | No | No | No |
| Quality verification | **Yes** | No | No | No |
| Auto cost reduction | **40-60%** | No | No | No |
| Cost tracking & analytics | Yes | Yes | Yes | No |
| Budget enforcement | Yes | No | No | Yes |
| Per-agent budgets | Yes | No | No | No |
| Loop detection | Yes | No | No | No |
| Anomaly detection | Yes | No | No | No |
| Auto-stop runaway agents | Yes | No | No | Partial |
| OpenClaw Skill | Yes | No | No | No |
| Self-host OSS | Yes | Yes | Yes | N/A |
| Streaming support | Yes | Yes | Yes | N/A |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## License

[MIT](LICENSE)
