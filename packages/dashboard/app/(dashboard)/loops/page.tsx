'use client';

import { trpc } from '../../../lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatDate } from '../../../lib/utils';

export default function LoopsPage() {
  const { data, isLoading } = trpc.getLoopHistory.useQuery({ limit: 50 });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Loop Detection</h1>
        <p className="text-muted-foreground">History of detected agent loops</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4">Detected At</th>
                <th className="p-4">Session</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Prompt Hash</th>
                <th className="p-4 text-right">Match Count</th>
                <th className="p-4 text-right">Similarity</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((loop) => (
                <tr key={loop.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 text-sm">
                    {formatDate(loop.detectedAt)}
                  </td>
                  <td className="p-4 font-mono text-sm">
                    {loop.sessionId?.slice(0, 12) ?? 'N/A'}
                  </td>
                  <td className="p-4 text-sm">{loop.agentId ?? 'Unknown'}</td>
                  <td className="p-4 font-mono text-sm text-muted-foreground">
                    {loop.promptHash.slice(0, 16)}...
                  </td>
                  <td className="p-4 text-right text-sm font-medium">
                    {loop.matchCount}
                  </td>
                  <td className="p-4 text-right text-sm">
                    {loop.similarity?.toFixed(3) ?? 'N/A'}
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No loops detected yet. This is good!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
