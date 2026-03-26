'use client';

import { Bot } from 'lucide-react';
import { AgentBreakdownChart } from '../../../components/charts/agent-breakdown';
import { ModelUsageChart } from '../../../components/charts/model-usage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { trpc } from '../../../lib/trpc/client';
import { formatCost, formatNumber } from '../../../lib/utils';

function AgentsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-28" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20 ml-auto" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AgentsPage() {
  const { data, isLoading } = trpc.getAgentBreakdown.useQuery({ days: 30 });

  if (isLoading) {
    return <AgentsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Agents</h1>
        <p className="text-muted-foreground">Cost breakdown by agent and model</p>
      </div>

      {!data?.byAgent || data.byAgent.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bot className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">No agent data yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add an <code className="rounded bg-muted px-1">X-Agent-Id</code> header to your requests
            to see per-agent cost breakdowns.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost by Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentBreakdownChart data={data.byAgent} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <ModelUsageChart data={data?.byModel ?? []} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4">Agent</th>
                    <th className="p-4 text-right">Total Cost</th>
                    <th className="p-4 text-right">Requests</th>
                    <th className="p-4 text-right">Avg Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byAgent.map((agent) => (
                    <tr key={agent.agentId ?? 'unknown'} className="border-b">
                      <td className="p-4 text-sm font-medium">{agent.agentId ?? 'Unknown'}</td>
                      <td className="p-4 text-right font-mono text-sm">
                        {formatCost(agent.totalCost)}
                      </td>
                      <td className="p-4 text-right text-sm">{formatNumber(agent.requestCount)}</td>
                      <td className="p-4 text-right text-sm">{Math.round(agent.avgLatency)}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
