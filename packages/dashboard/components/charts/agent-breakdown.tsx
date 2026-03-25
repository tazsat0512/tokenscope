'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

interface AgentBreakdownProps {
  data: { agentId: string | null; totalCost: number }[];
}

export function AgentBreakdownChart({ data }: AgentBreakdownProps) {
  const chartData = data.map((d) => ({
    name: d.agentId ?? 'Unknown',
    value: d.totalCost,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toFixed(4)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
