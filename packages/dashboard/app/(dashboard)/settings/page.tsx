'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { trpc } from '../../../lib/trpc/client';

export default function SettingsPage() {
  const { data: settings, isLoading } = trpc.getSettings.useQuery();
  const utils = trpc.useUtils();
  const updateSettings = trpc.updateSettings.useMutation({
    onSuccess: () => utils.getSettings.invalidate(),
  });

  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [slackUrl, setSlackUrl] = useState<string>('');

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your TokenScope proxy</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>Use this key as your Authorization bearer token</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <code className="rounded bg-muted px-3 py-2 font-mono text-sm">
              {settings?.apiKeyHash
                ? `ts_****${settings.apiKeyHash.slice(-8)}`
                : 'No key generated'}
            </code>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Set your base URL to{' '}
            <code className="font-mono">https://proxy.tokenscope.dev/openai/v1</code> to start
            proxying.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget Limit</CardTitle>
          <CardDescription>
            Set a monthly spending limit. Requests will be blocked when exceeded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">$</span>
              <input
                type="number"
                placeholder={settings?.budgetLimitUsd?.toString() ?? 'No limit'}
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm w-32"
                step="0.01"
                min="0"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                updateSettings.mutate({
                  budgetLimitUsd: budgetLimit ? parseFloat(budgetLimit) : null,
                });
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slack Notifications</CardTitle>
          <CardDescription>
            Get alerts for budget warnings, loop detection, and anomalies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="url"
              placeholder={settings?.slackWebhookUrl ?? 'https://hooks.slack.com/services/...'}
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm flex-1"
            />
            <button
              type="button"
              onClick={() => {
                updateSettings.mutate({
                  slackWebhookUrl: slackUrl || null,
                });
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
