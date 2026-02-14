'use client';

import { Task } from '@shared/types';
import { weeklyAccuracyTrend, rollingAccuracyTrend, type TrendPoint } from '@shared/utils/trends';
import { calculatePerTaskAccuracy } from '@shared/utils/accuracy';
import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

type Props = {
  tasks: Task[];
};

type View = 'weekly' | 'rolling';

export function AccuracyTrend({ tasks }: Props) {
  const [view, setView] = useState<View>('weekly');

  const overallAccuracy = useMemo(() => calculatePerTaskAccuracy(tasks), [tasks]);

  const data: TrendPoint[] = useMemo(() => {
    if (view === 'weekly') return weeklyAccuracyTrend(tasks);
    return rollingAccuracyTrend(tasks, 10);
  }, [tasks, view]);

  if (data.length < 2) return null;

  return (
    <div className="rounded-xl bg-background-secondary p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Accuracy Trend</h2>
        <div className="flex rounded-lg bg-background overflow-hidden">
          <button
            onClick={() => setView('weekly')}
            className={`px-3 py-1.5 text-sm font-medium transition ${
              view === 'weekly'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setView('rolling')}
            className={`px-3 py-1.5 text-sm font-medium transition ${
              view === 'rolling'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Rolling
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #433e3f',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f3f4f6' }}
            formatter={(value, _name, props) => {
              const point = props.payload as unknown as TrendPoint;
              return [
                `${value}% (${point.taskCount} task${point.taskCount !== 1 ? 's' : ''})`,
                'Accuracy',
              ];
            }}
          />
          <ReferenceLine
            y={overallAccuracy}
            stroke="#6b7280"
            strokeDasharray="6 4"
            label={{
              value: `Avg ${overallAccuracy}%`,
              fill: '#6b7280',
              fontSize: 11,
              position: 'right',
            }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#087f8c"
            strokeWidth={2}
            dot={{ fill: '#087f8c', r: 4 }}
            activeDot={{ fill: '#0a9dae', r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
