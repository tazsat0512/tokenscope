'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CostTrendProps {
  data: { date: string; cost: number; requests: number }[];
}

export function CostTrendChart({ data }: CostTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis
          fontSize={12}
          tickFormatter={(v) => `$${v.toFixed(2)}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
        />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="hsl(221.2, 83.2%, 53.3%)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
