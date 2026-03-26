'use client';

import { FREE_PLAN_REQUEST_LIMIT, PRO_PLAN_PRICE_USD, PRO_PLAN_REQUEST_LIMIT } from '@reivo/shared';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { trpc } from '../../../lib/trpc/client';
import { formatNumber } from '../../../lib/utils';

function BillingSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-24" />
        <Skeleton className="mt-2 h-5 w-56" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-24" />
            <Skeleton className="mt-2 h-4 w-40" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mt-2 h-3 w-full rounded-full" />
            <Skeleton className="mt-2 h-4 w-20" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { data: settings, isLoading } = trpc.getSettings.useQuery();

  if (isLoading) {
    return <BillingSkeleton />;
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
            <Button
              size="lg"
              onClick={async () => {
                const res = await fetch('/api/create-checkout', { method: 'POST' });
                const { url } = await res.json();
                window.location.href = url;
              }}
            >
              Upgrade to Pro - ${PRO_PLAN_PRICE_USD}/mo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
