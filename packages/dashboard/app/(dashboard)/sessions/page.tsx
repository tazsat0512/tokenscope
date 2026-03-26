'use client';

import { Activity } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { trpc } from '../../../lib/trpc/client';
import { formatCost, formatDate, formatNumber } from '../../../lib/utils';

function SessionsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-52" />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16 ml-auto" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-5 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SessionsPage() {
  const { data, isLoading } = trpc.getSessions.useQuery({ limit: 50, offset: 0 });

  if (isLoading) {
    return <SessionsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">AI agent session history</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4">Session ID</th>
                  <th className="p-4">Agent</th>
                  <th className="p-4 text-right">Cost</th>
                  <th className="p-4 text-right">Requests</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((session, index) => (
                  <tr
                    key={`${session.sessionId ?? 'no-session'}-${index}`}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="p-4">
                      {session.sessionId ? (
                        <Link
                          href={`/sessions/${session.sessionId}`}
                          className="text-primary hover:underline font-mono text-sm"
                        >
                          {session.sessionId.slice(0, 12)}...
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">{session.agentId ?? 'Unknown'}</td>
                    <td className="p-4 text-right font-mono text-sm">
                      {formatCost(session.totalCost)}
                    </td>
                    <td className="p-4 text-right text-sm">{formatNumber(session.requestCount)}</td>
                    <td className="p-4">
                      {session.hasBlocked ? (
                        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(session.lastRequest)}
                    </td>
                  </tr>
                ))}
                {data?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Activity className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold">No sessions yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Sessions appear when you send requests through the Reivo proxy. Change
                          your base URL and send your first request.
                        </p>
                        <Link
                          href="/settings"
                          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          Set up API Keys
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
