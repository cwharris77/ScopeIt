import { calculatePerTaskAccuracy, type TaskForAccuracy } from './accuracy';

export interface TrendPoint {
  label: string;
  accuracy: number;
  taskCount: number;
}

interface TaskWithDate extends TaskForAccuracy {
  completed_at?: string | null;
}

/**
 * Group completed tasks by ISO week and compute accuracy per week.
 * Returns points sorted oldest-to-newest.
 */
export function weeklyAccuracyTrend(tasks: TaskWithDate[]): TrendPoint[] {
  const withDates = tasks.filter((t) => t.completed_at);

  const byWeek = new Map<string, TaskWithDate[]>();
  for (const task of withDates) {
    const date = new Date(task.completed_at!);
    // Get Monday of the week
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    const group = byWeek.get(key) || [];
    group.push(task);
    byWeek.set(key, group);
  }

  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, weekTasks]) => {
      const date = new Date(weekStart);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        label,
        accuracy: calculatePerTaskAccuracy(weekTasks),
        taskCount: weekTasks.length,
      };
    });
}

/**
 * Compute a rolling average of per-task accuracy over a window.
 * Tasks are sorted by completed_at ascending internally.
 * Returns one point per task.
 */
export function rollingAccuracyTrend(tasks: TaskWithDate[], window = 10): TrendPoint[] {
  const sorted = [...tasks]
    .filter((t) => t.completed_at)
    .sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime());

  return sorted.map((task, i) => {
    const start = Math.max(0, i - window + 1);
    const windowTasks = sorted.slice(start, i + 1);
    const date = new Date(task.completed_at!);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      label,
      accuracy: calculatePerTaskAccuracy(windowTasks),
      taskCount: windowTasks.length,
    };
  });
}
