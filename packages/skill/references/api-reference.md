# TokenScope REST API Reference

All endpoints require authentication via API key header:

```
Authorization: Bearer ts_your_api_key
```

Base URL: `https://tokenscope-dashboard.vercel.app/api/v1`

---

## GET /overview

Get cost overview for a time period.

**Query Parameters:**
- `days` (number, default: 30) — Number of days to look back

**Response:**
```json
{
  "summary": {
    "totalCost": 45.23,
    "totalRequests": 1234,
    "totalInputTokens": 5678900,
    "totalOutputTokens": 1234567
  },
  "dailyCosts": [
    { "date": "2026-03-20", "cost": 5.12, "requests": 150 },
    { "date": "2026-03-21", "cost": 3.87, "requests": 98 }
  ],
  "topModels": [
    { "model": "claude-sonnet-4-6", "cost": 20.15, "requests": 500 },
    { "model": "gpt-4o", "cost": 15.08, "requests": 300 }
  ]
}
```

---

## GET /defense-status

Get current defense status (budget, loops, blocks).

**Response:**
```json
{
  "budgetLimit": 50.0,
  "budgetUsed": 23.45,
  "budgetPercent": 47,
  "loopsToday": 2,
  "loopsWeek": 5,
  "blockedToday": 0,
  "blockedWeek": 1
}
```

---

## GET /agents

Get cost breakdown by agent and model.

**Query Parameters:**
- `days` (number, default: 30) — Number of days to look back

**Response:**
```json
{
  "byAgent": [
    { "agentId": "research-agent", "totalCost": 20.5, "requestCount": 500, "avgLatency": 1200 }
  ],
  "byModel": [
    { "model": "claude-sonnet-4-6", "totalCost": 25.0, "requestCount": 600 }
  ]
}
```

---

## POST /settings

Update user settings (budget, Slack webhook).

**Request Body:**
```json
{
  "budgetLimitUsd": 50.0
}
```

Set to `null` to clear the budget limit.

**Response:**
```json
{
  "success": true
}
```
