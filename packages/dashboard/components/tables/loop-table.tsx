'use client';

import { formatDate } from '../../lib/utils';

interface LoopEvent {
  id: string;
  sessionId: string | null;
  agentId: string | null;
  promptHash: string;
  matchCount: number;
  similarity: number | null;
  detectedAt: number;
}

interface LoopTableProps {
  loops: LoopEvent[];
}

export function LoopTable({ loops }: LoopTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm text-muted-foreground">
            <th className="p-4">Detected At</th>
            <th className="p-4">Session</th>
            <th className="p-4">Agent</th>
            <th className="p-4">Prompt Hash</th>
            <th className="p-4 text-right">Matches</th>
            <th className="p-4 text-right">Similarity</th>
          </tr>
        </thead>
        <tbody>
          {loops.map((loop) => (
            <tr key={loop.id} className="border-b hover:bg-muted/50">
              <td className="p-4 text-sm">{formatDate(loop.detectedAt)}</td>
              <td className="p-4 font-mono text-sm">{loop.sessionId?.slice(0, 12) ?? 'N/A'}</td>
              <td className="p-4 text-sm">{loop.agentId ?? 'Unknown'}</td>
              <td className="p-4 font-mono text-sm text-muted-foreground">
                {loop.promptHash.slice(0, 16)}...
              </td>
              <td className="p-4 text-right font-medium text-sm">{loop.matchCount}</td>
              <td className="p-4 text-right text-sm">{loop.similarity?.toFixed(3) ?? 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
