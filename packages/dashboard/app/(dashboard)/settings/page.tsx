'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { useToast } from '../../../components/ui/toast';
import { trpc } from '../../../lib/trpc/client';

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-28" />
        <Skeleton className="mt-2 h-5 w-56" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full max-w-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const PROVIDERS = ['openai', 'anthropic', 'google'] as const;
type Provider = (typeof PROVIDERS)[number];

function ProviderKeySection({
  provider,
  keys,
}: {
  provider: Provider;
  keys: { id: string; label: string; keyPreview: string; isDefault: boolean }[];
}) {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');

  const addKey = trpc.addProviderKey.useMutation({
    onSuccess: () => {
      utils.getProviderKeys.invalidate();
      utils.getProviderKeyStatus.invalidate();
      utils.getOnboardingStatus.invalidate();
      setAdding(false);
      setNewLabel('');
      setNewKey('');
      toast({ title: 'Key added' });
    },
    onError: () => toast({ title: 'Failed to add key', variant: 'destructive' }),
  });

  const removeKey = trpc.removeProviderKey.useMutation({
    onSuccess: () => {
      utils.getProviderKeys.invalidate();
      utils.getProviderKeyStatus.invalidate();
      toast({ title: 'Key removed' });
    },
    onError: () => toast({ title: 'Failed to remove key', variant: 'destructive' }),
  });

  const setDefault = trpc.setDefaultProviderKey.useMutation({
    onSuccess: () => {
      utils.getProviderKeys.invalidate();
      toast({ title: 'Default key updated' });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold capitalize">{provider}</Label>
        <span className="text-xs text-muted-foreground">
          {keys.length} key{keys.length !== 1 ? 's' : ''}
        </span>
      </div>

      {keys.length > 0 && (
        <div className="space-y-2">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{k.label}</span>
                  {k.isDefault && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Default
                    </span>
                  )}
                </div>
                <code className="text-xs text-muted-foreground">{k.keyPreview}</code>
              </div>
              <div className="flex items-center gap-1">
                {!k.isDefault && keys.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDefault.mutate({ provider, keyId: k.id })}
                    disabled={setDefault.isPending}
                    className="text-xs"
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeKey.mutate({ provider, keyId: k.id })}
                  disabled={removeKey.isPending}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="space-y-2 rounded-md border border-dashed p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Label (e.g. Production)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-40"
            />
            <Input
              type="password"
              placeholder="API key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => addKey.mutate({ provider, label: newLabel || 'Default', key: newKey })}
              disabled={!newKey || addKey.isPending}
            >
              {addKey.isPending ? 'Adding...' : 'Add'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAdding(false);
                setNewLabel('');
                setNewKey('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          + Add Key
        </Button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { data: settings, isLoading } = trpc.getSettings.useQuery();
  const { data: providerKeys } = trpc.getProviderKeys.useQuery();
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const generateApiKey = trpc.generateApiKey.useMutation({
    onSuccess: () => utils.getSettings.invalidate(),
    onError: () => toast({ title: 'Failed to generate API key', variant: 'destructive' }),
  });
  const updateSettings = trpc.updateSettings.useMutation({
    onSuccess: () => {
      utils.getSettings.invalidate();
      toast({ title: 'Settings saved' });
    },
    onError: () => toast({ title: 'Failed to save settings', variant: 'destructive' }),
  });

  const { data: budgetPoliciesData } = trpc.getBudgetPolicies.useQuery();
  const upsertPolicy = trpc.upsertBudgetPolicy.useMutation({
    onSuccess: () => {
      utils.getBudgetPolicies.invalidate();
      toast({ title: 'Budget policy saved' });
    },
    onError: () => toast({ title: 'Failed to save policy', variant: 'destructive' }),
  });
  const deletePolicy = trpc.deleteBudgetPolicy.useMutation({
    onSuccess: () => {
      utils.getBudgetPolicies.invalidate();
      toast({ title: 'Budget policy removed' });
    },
  });

  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [budgetAction, setBudgetAction] = useState<string>('block');
  const [slackUrl, setSlackUrl] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [newAgentId, setNewAgentId] = useState('');
  const [newAgentLimit, setNewAgentLimit] = useState('');
  const [newAgentAction, setNewAgentAction] = useState<string>('block');

  if (isLoading) {
    return <SettingsSkeleton />;
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
      toast({ title: 'API key copied to clipboard' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your Reivo proxy</p>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Reivo API Key</CardTitle>
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
                  <Button onClick={handleCopyKey} size="sm">
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <code className="rounded bg-muted px-3 py-2 font-mono text-sm">
                  {settings?.apiKeyHash
                    ? `rv_****${settings.apiKeyHash.slice(-8)}`
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
                  <Button onClick={handleGenerateKey} disabled={generateApiKey.isPending} size="sm">
                    {generateApiKey.isPending ? 'Generating...' : 'Confirm'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowConfirm(true)}>
                  {settings?.apiKeyHash ? 'Regenerate Key' : 'Generate API Key'}
                </Button>
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
            Add your API keys for each provider. You can add multiple keys and choose a default.
            Keys are encrypted at rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {PROVIDERS.map((provider) => (
              <ProviderKeySection
                key={provider}
                provider={provider}
                keys={providerKeys?.[provider] ?? []}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Routing */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Routing</CardTitle>
          <CardDescription>
            Automatically route requests to cost-optimal models based on task complexity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Smart Routing</Label>
              <p className="text-sm text-muted-foreground">
                Route simple requests to cheaper models automatically
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings?.routingEnabled ? true : false}
              onClick={() => {
                updateSettings.mutate({ routingEnabled: !settings?.routingEnabled });
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings?.routingEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings?.routingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {settings?.routingEnabled && (
            <div>
              <Label>Routing Mode</Label>
              <select
                value={settings?.routingMode ?? 'auto'}
                onChange={(e) =>
                  updateSettings.mutate({
                    routingMode: e.target.value as 'auto' | 'conservative' | 'aggressive' | 'off',
                  })
                }
                className="mt-1 block w-full max-w-xs rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="auto">Auto (Conservative)</option>
                <option value="conservative">Conservative - downgrade only when confident</option>
                <option value="aggressive">
                  Aggressive - downgrade unless complexity detected
                </option>
                <option value="off">Off - passthrough only</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Limit */}
      <Card>
        <CardHeader>
          <CardTitle>Global Budget</CardTitle>
          <CardDescription>
            Set a monthly spending limit and choose what happens when it&apos;s exceeded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder={settings?.budgetLimitUsd?.toString() ?? 'No limit'}
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-32"
                step="0.01"
                min="0"
              />
            </div>
            <select
              value={budgetAction}
              onChange={(e) => setBudgetAction(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="block">Block requests</option>
              <option value="alert">Alert only (continue)</option>
              <option value="downgrade">Auto-downgrade model</option>
            </select>
            <Button
              onClick={() => {
                updateSettings.mutate({
                  budgetLimitUsd: budgetLimit ? Number.parseFloat(budgetLimit) : null,
                });
                if (budgetLimit) {
                  upsertPolicy.mutate({
                    agentId: null,
                    limitUsd: Number.parseFloat(budgetLimit),
                    action: budgetAction as 'block' | 'alert' | 'downgrade',
                  });
                }
              }}
            >
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Block</strong> = reject requests (429). <strong>Alert</strong> = notify via
            Slack but continue. <strong>Downgrade</strong> = auto-switch to cheaper models.
          </p>
        </CardContent>
      </Card>

      {/* Per-Agent Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Budgets</CardTitle>
          <CardDescription>
            Set individual spending limits per agent. Overrides the global budget for matching
            agents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetPoliciesData
            ?.filter((p) => p.agentId)
            .map((policy) => (
              <div key={policy.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                <code className="text-sm font-medium">{policy.agentId}</code>
                <span className="text-sm text-muted-foreground">${policy.limitUsd.toFixed(2)}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                  {policy.action}
                </span>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePolicy.mutate({ id: policy.id })}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            ))}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Agent ID"
              value={newAgentId}
              onChange={(e) => setNewAgentId(e.target.value)}
              className="w-40"
            />
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="Limit"
                value={newAgentLimit}
                onChange={(e) => setNewAgentLimit(e.target.value)}
                className="w-24"
                step="0.01"
                min="0"
              />
            </div>
            <select
              value={newAgentAction}
              onChange={(e) => setNewAgentAction(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="block">Block</option>
              <option value="alert">Alert</option>
              <option value="downgrade">Downgrade</option>
            </select>
            <Button
              size="sm"
              disabled={!newAgentId || !newAgentLimit}
              onClick={() => {
                upsertPolicy.mutate({
                  agentId: newAgentId,
                  limitUsd: Number.parseFloat(newAgentLimit),
                  action: newAgentAction as 'block' | 'alert' | 'downgrade',
                });
                setNewAgentId('');
                setNewAgentLimit('');
                setNewAgentAction('block');
              }}
            >
              Add
            </Button>
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
            <Input
              type="url"
              placeholder={settings?.slackWebhookUrl ?? 'https://hooks.slack.com/services/...'}
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => {
                updateSettings.mutate({
                  slackWebhookUrl: slackUrl || null,
                });
              }}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
