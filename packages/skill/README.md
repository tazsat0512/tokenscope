# Reivo Skill for OpenClaw

Track AI agent costs, set budget limits, and auto-detect runaway loops — directly from your OpenClaw agent.

## What It Does

Reivo adds cost awareness to your AI agent. Every API call is tracked, budgets are enforced, and runaway loops are automatically detected and stopped.

| Feature | Description |
|---------|-------------|
| Real-time cost tracking | See per-session, per-agent, per-model costs |
| Budget enforcement | Set monthly limits — requests blocked when exceeded |
| Loop detection | Auto-detects infinite loops via prompt similarity |
| Multi-provider | Works with OpenAI, Anthropic, and Google models |

## Quick Start

### 1. Install from ClawHub

```bash
npx clawhub@latest install reivo
```

### 2. Get Your API Key

1. Sign up at [app.reivo.dev](https://app.reivo.dev)
2. Go to Settings → Generate API Key
3. Set the environment variable:

```bash
export REIVO_API_KEY="rv_your_key_here"
```

### 3. Route API Calls Through Proxy

Update your OpenClaw provider config to use Reivo proxy URLs:

| Provider | Proxy Base URL |
|----------|---------------|
| OpenAI | `https://proxy.reivo.dev/openai/v1` |
| Anthropic | `https://proxy.reivo.dev/anthropic/v1` |
| Google | `https://proxy.reivo.dev/google/v1beta` |

### 4. Talk to Your Agent

Once installed, just ask:

- *"How much am I spending?"* — Shows cost breakdown
- *"Set my budget to $50"* — Enforces monthly limit
- *"Which agent costs the most?"* — Agent-by-agent breakdown
- *"Open dashboard"* — Link to full analytics

## How It Works

```
Your Agent → Reivo Proxy → LLM Provider (OpenAI/Anthropic/Google)
                  ↓
          Cost tracking, loop detection, budget enforcement
                  ↓
          Reivo Dashboard (detailed analytics)
```

The proxy is transparent — your agent works exactly the same, but every request is monitored for cost and anomalies.

## Pricing

| | Free (Skill) | Dashboard Pro ($49/mo) |
|---|---|---|
| Cost tracking | ✅ | ✅ |
| Budget limits | ✅ | ✅ |
| Loop detection | ✅ | ✅ |
| 7-day history | — | ✅ |
| 90-day history | — | ✅ |
| Optimization tips | — | ✅ |
| Slack alerts | — | ✅ |
| Team budgets | — | ✅ (Team $199/mo) |

The skill itself is **completely free**. The dashboard offers extended history and advanced features for power users.

## Links

- **Dashboard:** [app.reivo.dev](https://app.reivo.dev)
- **GitHub:** [github.com/tazsat0512/reivo](https://github.com/tazsat0512/reivo)
- **Docs:** See `references/` directory
