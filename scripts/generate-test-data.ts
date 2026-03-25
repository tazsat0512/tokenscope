import { calculateCost, PRICING_TABLE } from '@tokenscope/shared';

// Generate test request log data for development
const models = Object.keys(PRICING_TABLE);
const _providers = ['openai', 'anthropic', 'google'] as const;
const agents = ['code-reviewer', 'test-writer', 'bug-fixer', 'doc-generator', null];
const sessions = Array.from({ length: 10 }, () => crypto.randomUUID());

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLog(timestamp: number) {
  const model = randomElement(models);
  const provider =
    model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3')
      ? 'openai'
      : model.startsWith('claude')
        ? 'anthropic'
        : 'google';
  const inputTokens = Math.floor(Math.random() * 10000) + 100;
  const outputTokens = Math.floor(Math.random() * 5000) + 50;
  const cost = calculateCost(model, inputTokens, outputTokens);

  return {
    id: crypto.randomUUID(),
    userId: 'test-user-1',
    sessionId: randomElement(sessions),
    agentId: randomElement(agents),
    provider,
    model,
    inputTokens,
    outputTokens,
    costUsd: cost,
    promptHash: crypto.randomUUID().replace(/-/g, ''),
    latencyMs: Math.floor(Math.random() * 3000) + 200,
    timestamp,
    blocked: false,
    blockReason: null,
  };
}

// Generate 30 days of data
const now = Date.now();
const logs = [];

for (let day = 29; day >= 0; day--) {
  const dayStart = now - day * 24 * 60 * 60 * 1000;
  const requestsPerDay = Math.floor(Math.random() * 50) + 10;

  for (let i = 0; i < requestsPerDay; i++) {
    const timestamp = dayStart + Math.floor(Math.random() * 24 * 60 * 60 * 1000);
    logs.push(generateLog(timestamp));
  }
}

// Output as JSON for import
console.log(JSON.stringify(logs, null, 2));
console.error(`Generated ${logs.length} test log entries`);
