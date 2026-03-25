'use client';

import {
  FREE_PLAN_REQUEST_LIMIT,
  PRO_PLAN_PRICE_USD,
  PRO_PLAN_REQUEST_LIMIT,
} from '@tokenscope/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { trpc } from '../../../lib/trpc/client';
import { formatNumber } from '../../../lib/utils';

export default function BillingPage() {
  const { data: settings, isLoading } = trpc.getSettings.useQuery();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const plan = settings?.plan ?? 'free';
  const requestCount = settings?.requestCount ?? 0;
  const limit = plan === 'pro' ? PRO_PLAN_REQUEST_LIMIT : FREE_PLAN_REQUEST_LIMIT;
  const usagePercent = Math.round((requestCount / limit) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and usage</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>{plan === 'pro' ? 'Pro' : 'Free'} Plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {plan === 'pro' ? `$${PRO_PLAN_PRICE_USD}/mo` : 'Free'}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatNumber(limit)} requests/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>
              {formatNumber(requestCount)} / {formatNumber(limit)} requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{usagePercent}% used</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {plan === 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              Get 100K requests/month, priority support, and advanced features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={async () => {
                const res = await fetch('/api/create-checkout', { method: 'POST' });
                const { url } = await res.json();
                window.location.href = url;
              }}
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Upgrade to Pro - ${PRO_PLAN_PRICE_USD}/mo
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
