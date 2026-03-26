---
name: reivo
description: Track AI agent costs in real-time, set budget limits, and auto-detect runaway loops. Works with OpenAI, Anthropic, and Google models. Free to use — just route your API calls through the Reivo proxy.
version: 0.1.0
metadata:
  openclaw:
    requires:
      env:
        - REIVO_API_KEY
      bins:
        - curl
      anyBins:
        - jq
        - python3
    primaryEnv: REIVO_API_KEY
    emoji: "💰"
    homepage: https://reivo.dev
    os:
      - darwin
      - linux
---

# Reivo — AI Agent Cost Guard

You are now equipped with Reivo, a cost monitoring and protection layer for AI API calls.

## What Reivo Does

Reivo is a transparent proxy that sits between your agent and the LLM provider. It:
- **Tracks costs** per session, agent, and model in real-time
- **Enforces budget limits** — blocks requests when spending exceeds the limit
- **Detects runaway loops** — auto-stops agents stuck in infinite loops
- **Logs everything** to a dashboard for analysis

## Configuration

The user's Reivo API key is available as `$REIVO_API_KEY`.

**Proxy base URLs** (use these instead of direct provider URLs):
- OpenAI: `https://proxy.reivo.dev/openai/v1`
- Anthropic: `https://proxy.reivo.dev/anthropic/v1`
- Google: `https://proxy.reivo.dev/google/v1beta`

**Dashboard:** https://app.reivo.dev

## Available Commands

When the user asks about costs, budgets, or Reivo, use the following:

### Check Costs

When the user asks "how much am I spending?", "show costs", "cost report", or similar:

```bash
curl -s -H "Authorization: Bearer $REIVO_API_KEY" \
  "https://app.reivo.dev/api/v1/overview?days=7"
```

Present the response as:
- Total spend for the period
- Daily cost breakdown (as a simple text chart)
- Top models by cost
- Request count

### Check Defense Status

When the user asks "budget status", "am I safe?", "loop status", or similar:

```bash
curl -s -H "Authorization: Bearer $REIVO_API_KEY" \
  "https://app.reivo.dev/api/v1/defense-status"
```

Present as:
- Budget: $X.XX / $Y.YY (Z%) with visual progress bar
- Loops detected: N today, N this week
- Requests blocked: N today, N this week

### Set Budget

When the user says "set budget to $50", "limit spending", or similar:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $REIVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"budgetLimitUsd": 50}' \
  "https://app.reivo.dev/api/v1/settings"
```

Confirm the budget was set and explain that requests will be blocked once the limit is reached.

### Clear Budget

When the user says "remove budget", "clear limit", or similar:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $REIVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"budgetLimitUsd": null}' \
  "https://app.reivo.dev/api/v1/settings"
```

### View Agent Breakdown

When the user asks "which agent costs the most?", "cost by agent", or similar:

```bash
curl -s -H "Authorization: Bearer $REIVO_API_KEY" \
  "https://app.reivo.dev/api/v1/agents?days=30"
```

Present agent-by-agent and model-by-model cost breakdown.

### Open Dashboard

When the user says "open dashboard", "show dashboard", or "I want more detail":

> **Reivo Dashboard:** https://app.reivo.dev
>
> Sign in to see interactive cost charts, session replays, loop detection history, and optimization recommendations.

## Setup Instructions

If the user hasn't set up Reivo yet, guide them:

1. **Sign up** at https://app.reivo.dev
2. **Generate an API key** in Settings (format: `rv_...`)
3. **Set the environment variable:**
   ```bash
   export REIVO_API_KEY="rv_your_key_here"
   ```
4. **Route API calls through the proxy** by changing the base URL in your provider config.

For OpenClaw specifically, update the provider configuration:
```json
{
  "providers": [
    {
      "name": "openai",
      "apiKey": "${REIVO_API_KEY}",
      "baseUrl": "https://proxy.reivo.dev/openai/v1"
    },
    {
      "name": "anthropic",
      "apiKey": "${REIVO_API_KEY}",
      "baseUrl": "https://proxy.reivo.dev/anthropic/v1"
    }
  ]
}
```

The proxy forwards your requests to the real provider using the provider key you registered on the dashboard. Your original API keys never leave the Reivo server.

## Behavior Guidelines

- Always show costs in USD with 2 decimal places
- When budget is over 80%, proactively warn the user
- If an API call fails with 429 from Reivo proxy, explain it's a budget block (not rate limiting)
- Never expose the full API key in output — show only `rv_...xxxx` (last 4 chars)
- Suggest the dashboard for detailed analysis beyond what the API provides
