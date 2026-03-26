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
  const { data: providerStatus } = trpc.getProviderKeyStatus.useQuery();
  const utils = trpc.useUtils();

  const generateApiKey = trpc.generateApiKey.useMutation({
    onSuccess: () => utils.getSettings.invalidate(),
  });
  const updateSettings = trpc.updateSettings.useMutation({
    onSuccess: () => {
      utils.getSettings.invalidate();
      utils.getProviderKeyStatus.invalidate();
    },
  });

  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [slackUrl, setSlackUrl] = useState<string>('');
  const [providerKeys, setProviderKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const handleGenerateKey = async () => {
    const result = await generateApiKey.mutateAsync();
    setNewApiKey(result.apiKey);
    setCopied(false);
    setShowConfirm(false);
  };

  const handleCopyKey = async () => {
    if (newApiKey) {
      await navigator.clipboard.writeText(newApiKey);
      setCopied(true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your TokenScope proxy</p>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>
            Use this key as your Authorization bearer token when calling the proxy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {newApiKey ? (
            <div className="space-y-3">
              <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4">
                <p className="text-sm font-medium text-yellow-600 mb-2">
                  This key will only be shown once. Copy it now!
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm break-all">
                    {newApiKey}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Set your base URL to{' '}
                <code className="font-mono">https://proxy.tokenscope.dev/anthropic/v1</code> and
                use this key as the bearer token.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <code className="rounded bg-muted px-3 py-2 font-mono text-sm">
                  {settings?.apiKeyHash
                    ? `ts_****${settings.apiKeyHash.slice(-8)}`
                    : 'No key generated'}
                </code>
              </div>
              {showConfirm ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-destructive">
                    {settings?.apiKeyHash
                      ? 'This will invalidate your current key. Continue?'
                      : 'Generate a new API key?'}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateKey}
                    disabled={generateApiKey.isPending}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {generateApiKey.isPending ? 'Generating...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {settings?.apiKeyHash ? 'Regenerate Key' : 'Generate API Key'}
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Provider API Keys</CardTitle>
          <CardDescription>
            Enter your API keys for the providers you want to proxy. Keys are encrypted at rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(['openai', 'anthropic', 'google'] as const).map((provider) => (
              <div key={provider} className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium capitalize">{provider}</label>
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="password"
                    placeholder={
                      providerStatus?.[provider]
                        ? '••••••••••••  (key is set)'
                        : 'Not configured'
                    }
                    value={providerKeys[provider]}
                    onChange={(e) =>
                      setProviderKeys((prev) => ({ ...prev, [provider]: e.target.value }))
                    }
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  {providerStatus?.[provider] && (
                    <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const keys: Record<string, string | null> = {};
                  for (const [p, v] of Object.entries(providerKeys)) {
                    if (v) keys[p] = v;
                  }
                  if (Object.keys(keys).length === 0) return;
                  updateSettings.mutate(
                    { providerKeys: keys },
                    {
                      onSuccess: () => setProviderKeys({ openai: '', anthropic: '', google: '' }),
                    },
                  );
                }}
                disabled={
                  updateSettings.isPending ||
                  !Object.values(providerKeys).some((v) => v)
                }
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {updateSettings.isPending ? 'Saving...' : 'Save Keys'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Limit */}
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

      {/* Slack Notifications */}
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
