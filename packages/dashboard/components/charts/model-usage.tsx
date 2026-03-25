'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ModelUsageProps {
  data: { model: string; totalCost: number; requestCount: number }[];
}

export function ModelUsageChart({ data }: ModelUsageProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.slice(0, 10)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="model" fontSize={11} angle={-30} textAnchor="end" height={80} />
        <YAxis fontSize={12} tickFormatter={(v) => `$${v.toFixed(2)}`} />
        <Tooltip formatter={(value: number) => `$${value.toFixed(4)}`} />
        <Bar dataKey="totalCost" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
