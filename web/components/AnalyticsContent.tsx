'use client';

import { TASK_STATUS } from '@shared/constants';
import { useTasks } from '@shared/hooks/useTasks';
import { secondsToDisplay } from '@shared/utils';
import { calculatePerTaskAccuracy } from '@shared/utils/accuracy';
import { AccuracyTrend } from './AccuracyTrend';
import { AiInsights } from './AiInsights';
import { PerformanceChart } from './PerformanceChart';
import { StatsCards } from './StatsCards';

export default function AnalyticsContent() {
  const { tasks, loading } = useTasks();

  const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED);
  const totalSeconds = completedTasks.reduce((sum, t) => sum + (t.actual_seconds || 0), 0);
  const accuracy = calculatePerTaskAccuracy(completedTasks);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (completedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-muted">
        <p className="text-lg">No completed tasks yet</p>
        <p className="text-sm">Complete some tasks to see your analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Insights</h1>
      <StatsCards
        completedCount={completedTasks.length}
        totalTime={secondsToDisplay(totalSeconds)}
        accuracy={accuracy}
      />
      <AccuracyTrend tasks={completedTasks} />
      <PerformanceChart tasks={completedTasks.slice(0, 5)} />
      <AiInsights />
    </div>
  );
}
