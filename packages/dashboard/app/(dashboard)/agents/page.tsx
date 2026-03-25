'use client';

import { AgentBreakdownChart } from '../../../components/charts/agent-breakdown';
import { ModelUsageChart } from '../../../components/charts/model-usage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { trpc } from '../../../lib/trpc/client';
import { formatCost, formatNumber } from '../../../lib/utils';

export default function AgentsPage() {
  const { data, isLoading } = trpc.getAgentBreakdown.useQuery({ days: 30 });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Agents</h1>
        <p className="text-muted-foreground">Cost breakdown by agent and model</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost by Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentBreakdownChart data={data?.byAgent ?? []} />
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
              {data?.byAgent.map((agent) => (
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
    </div>
  );
}
