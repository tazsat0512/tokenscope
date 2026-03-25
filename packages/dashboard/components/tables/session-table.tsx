'use client';

import Link from 'next/link';
import { formatCost, formatDate, formatNumber } from '../../lib/utils';

interface Session {
  sessionId: string | null;
  agentId: string | null;
  totalCost: number;
  requestCount: number;
  firstRequest: number;
  lastRequest: number;
  hasBlocked: boolean;
}

interface SessionTableProps {
  sessions: Session[];
}

export function SessionTable({ sessions }: SessionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm text-muted-foreground">
            <th className="p-4">Session</th>
            <th className="p-4">Agent</th>
            <th className="p-4 text-right">Cost</th>
            <th className="p-4 text-right">Requests</th>
            <th className="p-4">Status</th>
            <th className="p-4">Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.sessionId ?? 'none'} className="border-b hover:bg-muted/50">
              <td className="p-4 font-mono text-sm">
                {s.sessionId ? (
                  <Link href={`/sessions/${s.sessionId}`} className="text-primary hover:underline">
                    {s.sessionId.slice(0, 12)}...
                  </Link>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="p-4 text-sm">{s.agentId ?? 'Unknown'}</td>
              <td className="p-4 text-right font-mono text-sm">{formatCost(s.totalCost)}</td>
              <td className="p-4 text-right text-sm">{formatNumber(s.requestCount)}</td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    s.hasBlocked
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-green-500/10 text-green-600'
                  }`}
                >
                  {s.hasBlocked ? 'Blocked' : 'Active'}
                </span>
              </td>
              <td className="p-4 text-sm text-muted-foreground">{formatDate(s.lastRequest)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
