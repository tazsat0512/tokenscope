---
name: tokenscope
description: Track AI agent costs in real-time, set budget limits, and auto-detect runaway loops. Works with OpenAI, Anthropic, and Google models. Free to use — just route your API calls through the TokenScope proxy.
version: 0.1.0
metadata:
  openclaw:
    requires:
      env:
        - TOKENSCOPE_API_KEY
      bins:
        - curl
      anyBins:
        - jq
        - python3
    primaryEnv: TOKENSCOPE_API_KEY
    emoji: "💰"
    homepage: https://tokenscope-amber.vercel.app
    os:
      - darwin
      - linux
---

# TokenScope — AI Agent Cost Guard

You are now equipped with TokenScope, a cost monitoring and protection layer for AI API calls.

## What TokenScope Does

TokenScope is a transparent proxy that sits between your agent and the LLM provider. It:
- **Tracks costs** per session, agent, and model in real-time
- **Enforces budget limits** — blocks requests when spending exceeds the limit
- **Detects runaway loops** — auto-stops agents stuck in infinite loops
- **Logs everything** to a dashboard for analysis

## Configuration

The user's TokenScope API key is available as `$TOKENSCOPE_API_KEY`.

**Proxy base URLs** (use these instead of direct provider URLs):
- OpenAI: `https://tokenscope-proxy.tazoelab.workers.dev/openai/v1`
- Anthropic: `https://tokenscope-proxy.tazoelab.workers.dev/anthropic/v1`
- Google: `https://tokenscope-proxy.tazoelab.workers.dev/google/v1beta`

**Dashboard:** https://tokenscope-amber.vercel.app

## Available Commands

When the user asks about costs, budgets, or TokenScope, use the following:

### Check Costs

When the user asks "how much am I spending?", "show costs", "cost report", or similar:

```bash
curl -s -H "Authorization: Bearer $TOKENSCOPE_API_KEY" \
  "https://tokenscope-amber.vercel.app/api/v1/overview?days=7"
```

Present the response as:
- Total spend for the period
- Daily cost breakdown (as a simple text chart)
- Top models by cost
- Request count

### Check Defense Status

When the user asks "budget status", "am I safe?", "loop status", or similar:

```bash
curl -s -H "Authorization: Bearer $TOKENSCOPE_API_KEY" \
  "https://tokenscope-amber.vercel.app/api/v1/defense-status"
```

Present as:
- Budget: $X.XX / $Y.YY (Z%) with visual progress bar
- Loops detected: N today, N this week
- Requests blocked: N today, N this week

### Set Budget

When the user says "set budget to $50", "limit spending", or similar:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKENSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"budgetLimitUsd": 50}' \
  "https://tokenscope-amber.vercel.app/api/v1/settings"
```

Confirm the budget was set and explain that requests will be blocked once the limit is reached.

### Clear Budget

When the user says "remove budget", "clear limit", or similar:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKENSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"budgetLimitUsd": null}' \
  "https://tokenscope-amber.vercel.app/api/v1/settings"
```

### View Agent Breakdown

When the user asks "which agent costs the most?", "cost by agent", or similar:

```bash
curl -s -H "Authorization: Bearer $TOKENSCOPE_API_KEY" \
  "https://tokenscope-amber.vercel.app/api/v1/agents?days=30"
```

Present agent-by-agent and model-by-model cost breakdown.

### Open Dashboard

When the user says "open dashboard", "show dashboard", or "I want more detail":

> **TokenScope Dashboard:** https://tokenscope-amber.vercel.app
>
> Sign in to see interactive cost charts, session replays, loop detection history, and optimization recommendations.

## Setup Instructions

If the user hasn't set up TokenScope yet, guide them:

1. **Sign up** at https://tokenscope-amber.vercel.app
2. **Generate an API key** in Settings (format: `ts_...`)
3. **Set the environment variable:**
   ```bash
   export TOKENSCOPE_API_KEY="ts_your_key_here"
   ```
4. **Route API calls through the proxy** by changing the base URL in your provider config.

For OpenClaw specifically, update the provider configuration:
```json
{
  "providers": [
    {
      "name": "openai",
      "apiKey": "${TOKENSCOPE_API_KEY}",
      "baseUrl": "https://tokenscope-proxy.tazoelab.workers.dev/openai/v1"
    },
    {
      "name": "anthropic",
      "apiKey": "${TOKENSCOPE_API_KEY}",
      "baseUrl": "https://tokenscope-proxy.tazoelab.workers.dev/anthropic/v1"
    }
  ]
}
```

The proxy forwards your requests to the real provider using the provider key you registered on the dashboard. Your original API keys never leave the TokenScope server.

## Behavior Guidelines

- Always show costs in USD with 2 decimal places
- When budget is over 80%, proactively warn the user
- If an API call fails with 429 from TokenScope proxy, explain it's a budget block (not rate limiting)
- Never expose the full API key in output — show only `ts_...xxxx` (last 4 chars)
- Suggest the dashboard for detailed analysis beyond what the API provides
