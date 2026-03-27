'use client';

import Link from 'next/link';
import { useState } from 'react';
import { trpc } from '../lib/trpc/client';

const steps = [
  {
    id: 'apiKey',
    title: 'Generate your Reivo API key',
    description: 'This key authenticates your requests through the proxy.',
    href: '/settings',
    cta: 'Go to Settings',
  },
  {
    id: 'providerKey',
    title: 'Add a provider API key',
    description: 'Add your OpenAI, Anthropic, or Google key. Reivo encrypts it with AES-256-GCM.',
    href: '/settings',
    cta: 'Add Provider Key',
  },
  {
    id: 'firstRequest',
    title: 'Send your first request',
    description: 'Change one line in your code — the base URL — and send a request.',
    href: null,
    cta: null,
  },
] as const;

const codeExamples = {
  openai: {
    label: 'OpenAI',
    python: `from openai import OpenAI

client = OpenAI(
    base_url="https://proxy.reivo.dev/openai/v1",
    api_key="rv_your_reivo_key",
)

res = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)`,
    curl: `curl https://proxy.reivo.dev/openai/v1/chat/completions \\
  -H "Authorization: Bearer rv_your_reivo_key" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'`,
  },
  anthropic: {
    label: 'Anthropic',
    python: `from anthropic import Anthropic

client = Anthropic(
    base_url="https://proxy.reivo.dev/anthropic",
    api_key="rv_your_reivo_key",
)

res = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)`,
    curl: `curl https://proxy.reivo.dev/anthropic/v1/messages \\
  -H "Authorization: Bearer rv_your_reivo_key" \\
  -H "Content-Type: application/json" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'`,
  },
  google: {
    label: 'Google',
    python: `import google.generativeai as genai

# For Google, set the API key in your Reivo dashboard,
# then use the proxy URL:
genai.configure(
    api_key="rv_your_reivo_key",
    transport="rest",
    client_options={"api_endpoint": "https://proxy.reivo.dev/google"},
)`,
    curl: `curl "https://proxy.reivo.dev/google/v1beta/models/gemini-2.5-flash:generateContent" \\
  -H "Authorization: Bearer rv_your_reivo_key" \\
  -H "Content-Type: application/json" \\
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'`,
  },
};

type Provider = keyof typeof codeExamples;
type Lang = 'python' | 'curl';

function CodeExampleBlock() {
  const [provider, setProvider] = useState<Provider>('openai');
  const [lang, setLang] = useState<Lang>('python');

  const example = codeExamples[provider];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-md bg-muted p-0.5">
          {(Object.keys(codeExamples) as Provider[]).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setProvider(p)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                provider === p
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {codeExamples[p].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-md bg-muted p-0.5">
          {(['python', 'curl'] as const).map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => setLang(l)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                lang === l
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l === 'python' ? 'Python' : 'cURL'}
            </button>
          ))}
        </div>
      </div>
      <pre className="overflow-x-auto rounded-md bg-zinc-950 p-3 text-xs text-zinc-300">
        <code>{example[lang]}</code>
      </pre>
      <p className="text-xs text-muted-foreground">
        That&apos;s it — costs, tokens, and latency appear here within seconds.
      </p>
    </div>
  );
}

export function OnboardingChecklist() {
  const { data, isLoading } = trpc.getOnboardingStatus.useQuery();

  if (isLoading || !data) return null;
  if (data.hasApiKey && data.hasProviderKey && data.hasFirstRequest) return null;

  const statusMap: Record<string, boolean> = {
    apiKey: data.hasApiKey,
    providerKey: data.hasProviderKey,
    firstRequest: data.hasFirstRequest,
  };

  const completedCount = Object.values(statusMap).filter(Boolean).length;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Get started with Reivo</h2>
          <p className="text-sm text-muted-foreground">
            3 steps to start monitoring your AI costs.
          </p>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {completedCount}/3 complete
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {steps.map((step, index) => {
          const done = statusMap[step.id];
          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 rounded-md border p-4 ${done ? 'bg-muted/30 opacity-60' : ''}`}
            >
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? 'bg-green-500 text-white'
                    : 'border-2 border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                {done ? '\u2713' : index + 1}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${done ? 'line-through' : ''}`}>{step.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                {!done && step.id === 'firstRequest' && <CodeExampleBlock />}
              </div>
              {!done && step.href && (
                <Link
                  href={step.href}
                  className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {step.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
