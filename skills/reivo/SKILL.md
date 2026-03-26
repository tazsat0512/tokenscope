---
name: reivo
description: LLM proxy that cuts API costs 40-60% via smart model routing. Tracks spending, enforces budgets, detects loops, auto-stops runaway agents. Supports OpenAI, Anthropic, Google. One base URL change to install.
homepage: https://reivo.dev
user-invocable: true
metadata: {"openclaw": {"emoji": "🦞", "homepage": "https://reivo.dev", "requires": {"env": ["REIVO_API_KEY"]}, "envVars": [{"name": "REIVO_API_KEY", "required": true, "description": "Reivo API key (starts with rv_). Get at reivo.dev/settings"}], "author": "tazsat0512", "links": {"homepage": "https://reivo.dev", "repository": "https://github.com/tazsat0512/reivo", "documentation": "https://reivo.dev/llms-full.txt"}}}
---

# Reivo — LLM Cost Optimizer

## What it does

- Routes each LLM request to the cheapest model that can handle it (40-60% cost reduction)
- Tracks cost per session, agent, and model in real time
- Enforces budget limits — blocks requests when the limit is reached
- Detects agent loops using prompt hashing and similarity analysis — auto-stops runaway agents
- Works with OpenAI, Anthropic, and Google via a single base URL change

## Commands

| Command | Description |
|---------|-------------|
| `/reivo status` | Check proxy connectivity and show dashboard link |
| `/reivo month` | Monthly cost analysis (via dashboard) |
| `/reivo on` | Info on enabling Smart Routing (via dashboard) |
| `/reivo off` | Info on disabling Smart Routing (via dashboard) |
| `/reivo budget` | Info on setting monthly budget cap (via dashboard) |
| `/reivo mode` | Info on changing routing mode (via dashboard) |
| `/reivo share` | Generate a link to your dashboard |

## Setup

1. Sign up at [reivo.dev](https://reivo.dev) and generate an API key
2. Set the environment variable:

```bash
export REIVO_API_KEY="rv_your_reivo_key"
```

3. Run `/reivo status` to confirm connectivity

## Configuration

All configuration (routing mode, budget caps, quality thresholds, notifications) is managed through the Reivo dashboard at [app.reivo.dev](https://app.reivo.dev/settings).

### LLM Provider Keys

Provider API keys (OpenAI, Anthropic, Google) are configured in the Reivo dashboard, not in this skill. The skill only needs the `REIVO_API_KEY` to check proxy connectivity.

## Requirements

- Reivo account (free tier: 10,000 requests/month)
- At least one LLM provider API key configured in the [Reivo dashboard](https://app.reivo.dev)

## Links

- Website: https://reivo.dev
- GitHub: https://github.com/tazsat0512/reivo
- Dashboard: https://app.reivo.dev
