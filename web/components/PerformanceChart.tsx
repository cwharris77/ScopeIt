'use client';

import { Task } from '@shared/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Props = {
  tasks: Task[];
};

export function PerformanceChart({ tasks }: Props) {
  const data = tasks
    .map((t) => ({
      name: t.name.length > 15 ? t.name.slice(0, 15) + '...' : t.name,
      estimated: t.estimated_minutes,
      actual: Math.round((t.actual_seconds || 0) / 60),
    }))
    .reverse(); // oldest first for chart left-to-right

  return (
    <div className="rounded-xl bg-background-secondary p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Performance</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            label={{
              value: 'Minutes',
              angle: -90,
              position: 'insideLeft',
              fill: '#9ca3af',
            }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #433e3f',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f3f4f6' }}
            itemStyle={{ color: '#f3f4f6' }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
          <Bar dataKey="estimated" name="Estimated" fill="#087f8c" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" name="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
