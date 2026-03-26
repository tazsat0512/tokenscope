# Reivo API Reference

## Proxy Endpoints

Reivo acts as a transparent proxy. Point your AI SDK's base URL to the proxy and it handles the rest.

### Base URLs

| Provider | Base URL |
|----------|----------|
| OpenAI | `https://proxy.reivo.dev/openai/v1` |
| Anthropic | `https://proxy.reivo.dev/anthropic/v1` |
| Google | `https://proxy.reivo.dev/google/v1beta` |

### Authentication

All requests require a Reivo API key:

```
Authorization: Bearer rv_your_api_key_here
```

### Custom Headers

| Header | Description | Example |
|--------|-------------|---------|
| `x-session-id` | Group requests by session | `x-session-id: sess_abc123` |
| `x-agent-id` | Identify the agent | `x-agent-id: code-reviewer` |

### Response Headers

Reivo injects these headers into every response:

| Header | Description |
|--------|-------------|
| `x-reivo-request-id` | Unique request ID for debugging |
| `x-reivo-budget-used` | Current budget usage in USD |
| `x-reivo-budget-remaining` | Remaining budget in USD |

### Error Responses

#### 401 Unauthorized
```json
{ "error": "Invalid API key. Use a Reivo key (rv_...)" }
```

#### 429 Budget Exceeded
```json
{
  "error": "Budget exceeded",
  "budget_used": "10.5000",
  "budget_limit": "10.0000"
}
```

#### 429 Loop Detected
```json
{
  "error": "Loop detected",
  "match_count": 5,
  "message": "Repeated prompt detected. Request blocked."
}
```

## Usage Examples

### OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://proxy.reivo.dev/openai/v1",
    api_key="rv_your_key",
    default_headers={
        "x-session-id": "my-session",
        "x-agent-id": "my-agent",
    }
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### OpenAI SDK (TypeScript)

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://proxy.reivo.dev/openai/v1',
  apiKey: 'rv_your_key',
  defaultHeaders: {
    'x-session-id': 'my-session',
    'x-agent-id': 'my-agent',
  },
});
```

### Anthropic SDK

```python
import anthropic

client = anthropic.Anthropic(
    base_url="https://proxy.reivo.dev/anthropic",
    api_key="rv_your_key",
)
```

### curl

```bash
curl https://proxy.reivo.dev/openai/v1/chat/completions \
  -H "Authorization: Bearer rv_your_key" \
  -H "x-session-id: test-session" \
  -H "x-agent-id: my-agent" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Health Check

```
GET /health
```

Returns `{ "status": "ok", "timestamp": 1234567890 }`
