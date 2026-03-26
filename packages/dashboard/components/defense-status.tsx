'use client';

import { trpc } from '../lib/trpc/client';
import { formatCost } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function DefenseStatus() {
  const { data, isLoading } = trpc.getDefenseStatus.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
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
    );
  }

  if (!data) return null;

  const budgetColor =
    data.budgetPercent === null
      ? 'text-muted-foreground'
      : data.budgetPercent >= 100
        ? 'text-red-600'
        : data.budgetPercent >= 80
          ? 'text-yellow-600'
          : 'text-green-600';

  const budgetBg =
    data.budgetPercent === null
      ? 'bg-muted'
      : data.budgetPercent >= 100
        ? 'bg-red-500'
        : data.budgetPercent >= 80
          ? 'bg-yellow-500'
          : 'bg-green-500';

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Budget */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          {data.budgetLimit ? (
            <>
              <div className={`text-2xl font-bold ${budgetColor}`}>{data.budgetPercent}%</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCost(data.budgetUsed)} / {formatCost(data.budgetLimit)}
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${budgetBg} transition-all`}
                  style={{ width: `${Math.min(data.budgetPercent ?? 0, 100)}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-muted-foreground">—</div>
              <p className="mt-1 text-xs text-muted-foreground">No budget limit set</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Loops Detected */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Loops Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${data.loopsToday > 0 ? 'text-yellow-600' : 'text-green-600'}`}
          >
            {data.loopsToday}
            <span className="ml-1 text-sm font-normal text-muted-foreground">today</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{data.loopsWeek} this week</p>
        </CardContent>
      </Card>

      {/* Auto-Stops */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Requests Blocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${data.blockedToday > 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            {data.blockedToday}
            <span className="ml-1 text-sm font-normal text-muted-foreground">today</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{data.blockedWeek} this week</p>
        </CardContent>
      </Card>
    </div>
  );
}
