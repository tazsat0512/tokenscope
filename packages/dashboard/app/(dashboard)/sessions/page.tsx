'use client';

import Link from 'next/link';
import { Card, CardContent } from '../../../components/ui/card';
import { trpc } from '../../../lib/trpc/client';
import { formatCost, formatDate, formatNumber } from '../../../lib/utils';

export default function SessionsPage() {
  const { data, isLoading } = trpc.getSessions.useQuery({ limit: 50, offset: 0 });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
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
                {data?.map((session) => (
                  <tr
                    key={session.sessionId ?? 'no-session'}
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
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
