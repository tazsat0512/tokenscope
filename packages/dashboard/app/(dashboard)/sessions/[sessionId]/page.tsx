'use client';

import { use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';
import { trpc } from '../../../../lib/trpc/client';
import { formatCost, formatDate } from '../../../../lib/utils';

export default function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const { data: logs, isLoading } = trpc.getSessionDetail.useQuery({ sessionId });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="ml-auto h-5 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Session Detail</h1>
        <p className="text-muted-foreground font-mono">{sessionId}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs?.map((log, i) => (
              <div
                key={log.id}
                className={`relative pl-8 pb-4 ${i < (logs.length - 1) ? 'border-l-2 border-muted ml-3' : 'ml-3'}`}
              >
                <div
                  className={`absolute left-[-5px] top-1 h-3 w-3 rounded-full ${
                    log.blocked ? 'bg-destructive' : 'bg-primary'
                  }`}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{log.model}</span>
                      <span className="text-xs text-muted-foreground">({log.provider})</span>
                      {log.blocked && (
                        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Blocked: {log.blockReason}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {log.inputTokens} in / {log.outputTokens} out &middot; {log.latencyMs}ms
                      &middot; {formatCost(log.costUsd)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(log.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
