'use client';

import Link from 'next/link';
import { CostTrendChart } from '../../../components/charts/cost-trend';
import { DefenseStatus } from '../../../components/defense-status';
import { OnboardingChecklist } from '../../../components/onboarding';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { trpc } from '../../../lib/trpc/client';
import { formatCost, formatNumber } from '../../../lib/utils';

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function OverviewPage() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data, isLoading } = trpc.getOverview.useQuery({ days: 30, tz });
  const { data: routingStats } = trpc.getRoutingStats.useQuery({ days: 30 });
  const { data: settings } = trpc.getSettings.useQuery();

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  const summary = data?.summary;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Your AI agent cost dashboard</p>
      </div>

      <OnboardingChecklist />

      <DefenseStatus />

      {settings?.plan === 'free' && (!routingStats || routingStats.totalRouted === 0) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-muted-foreground">
              Smart Routing could save you{' '}
              <span className="font-medium text-foreground">
                {formatCost((summary?.totalCost ?? 0) * 0.15)}
              </span>
              /month based on your usage.
            </p>
            <Link
              href="/billing"
              className="ml-4 shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Upgrade to Pro
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(summary?.totalCost ?? 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary?.totalRequests ?? 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated Savings (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {routingStats && routingStats.totalRouted > 0 ? (
              <div className="text-2xl font-bold text-green-600">
                {formatCost(routingStats.totalRouted * 0.003)}
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">$0.00</div>
                <p className="mt-1 text-xs text-muted-foreground">Enable Smart Routing to save</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Cost/Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalRequests ? formatCost(summary.totalCost / summary.totalRequests) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routing Stats */}
      {routingStats && routingStats.totalRouted > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Smart Routing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Routed Requests</p>
                <p className="text-2xl font-bold">
                  {formatNumber(routingStats.totalRouted)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    / {formatNumber(routingStats.totalRequests)}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Routing Rate</p>
                <p className="text-2xl font-bold">
                  {routingStats.totalRequests > 0
                    ? Math.round((routingStats.totalRouted / routingStats.totalRequests) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recent Decisions</p>
                <div className="mt-1 max-h-24 space-y-1 overflow-y-auto">
                  {routingStats.recentDecisions.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center gap-2 text-xs">
                      <code className="rounded bg-muted px-1">{d.model}</code>
                      <span className="text-muted-foreground">&rarr;</span>
                      <code className="rounded bg-primary/10 px-1 text-primary">
                        {d.routedModel}
                      </code>
                      <span className="text-muted-foreground">{d.routingReason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cost Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTrendChart data={data?.dailyCosts ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
