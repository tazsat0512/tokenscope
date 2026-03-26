'use client';

import Link from 'next/link';
import { trpc } from '../lib/trpc/client';

const steps = [
  {
    id: 'apiKey',
    title: 'Generate your API key',
    description: 'Create a Reivo API key to authenticate proxy requests.',
    href: '/settings',
    cta: 'Go to Settings',
  },
  {
    id: 'providerKey',
    title: 'Add a provider key',
    description: 'Add your OpenAI, Anthropic, or Google API key. Start with just one.',
    href: '/settings',
    cta: 'Add Provider Key',
  },
  {
    id: 'firstRequest',
    title: 'Send your first request',
    description: 'Change your base URL and send a request through the proxy.',
    href: null,
    cta: null,
  },
] as const;

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
            Complete these steps to start monitoring your AI costs.
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
                {done ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${done ? 'line-through' : ''}`}>{step.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                {!done && step.id === 'firstRequest' && (
                  <div className="mt-3 rounded-md bg-muted p-3">
                    <p className="text-xs font-medium mb-2">Update your base URL:</p>
                    <code className="text-xs block">
                      baseURL: &quot;https://proxy.reivo.dev/anthropic/v1&quot;
                    </code>
                  </div>
                )}
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
