# Estimation Trends Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an accuracy trend line chart to the web analytics page with weekly and per-task rolling average views.

**Architecture:** A new `AccuracyTrend` component computes trend data from completed tasks client-side using the existing `calculatePerTaskAccuracy` utility. No backend changes. A shared helper function handles the grouping/rolling logic so it can be reused on mobile later.

**Tech Stack:** Recharts (LineChart, ReferenceLine), shared/utils for computation logic

---

### Task 1: Add trend computation helpers to shared/utils

**Files:**
- Create: `shared/utils/trends.ts`
- Modify: `shared/utils/index.ts`

**Step 1: Create the trend computation module**

Create `shared/utils/trends.ts` with two functions — one for weekly grouping, one for rolling average:

```ts
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
 * Tasks must be sorted by completed_at ascending before calling.
 * Returns one point per task.
 */
export function rollingAccuracyTrend(tasks: TaskWithDate[], window = 10): TrendPoint[] {
  const sorted = [...tasks]
    .filter((t) => t.completed_at)
    .sort(
      (a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime()
    );

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
```

**Step 2: Export from barrel**

Add to `shared/utils/index.ts`:

```ts
export * from './trends';
```

**Step 3: Verify**

Run: `cd /Users/cwharris/Documents/GitHubProjects/ScopeIt && npm run typecheck`
Expected: No errors.

**Step 4: Commit**

```bash
git add shared/utils/trends.ts shared/utils/index.ts
git commit -m "feat: add weekly and rolling accuracy trend computation helpers

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Create AccuracyTrend chart component

**Files:**
- Create: `web/components/AccuracyTrend.tsx`

**Step 1: Build the component**

```tsx
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

  if (data.length < 2) return null; // Need at least 2 points for a trend

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
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
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
            formatter={(value: number, _name: string, props: { payload: TrendPoint }) => [
              `${value}% (${props.payload.taskCount} task${props.payload.taskCount !== 1 ? 's' : ''})`,
              'Accuracy',
            ]}
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
```

**Step 2: Verify**

Run: `cd /Users/cwharris/Documents/GitHubProjects/ScopeIt/web && npm run build`
Expected: Builds successfully.

**Step 3: Commit**

```bash
git add web/components/AccuracyTrend.tsx
git commit -m "feat: add AccuracyTrend line chart component with weekly/rolling toggle

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Wire AccuracyTrend into analytics page

**Files:**
- Modify: `web/components/AnalyticsContent.tsx`

**Step 1: Add the import and render the component**

In `web/components/AnalyticsContent.tsx`:

Add import:
```tsx
import { AccuracyTrend } from './AccuracyTrend';
```

In the return JSX, add `<AccuracyTrend tasks={completedTasks} />` between `<StatsCards ... />` and `<PerformanceChart ... />`:

```tsx
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
      <AiInsights tasks={completedTasks} />
    </div>
  );
```

**Step 2: Verify**

Run: `cd /Users/cwharris/Documents/GitHubProjects/ScopeIt/web && npm run build`
Expected: Builds successfully.

Run: `cd /Users/cwharris/Documents/GitHubProjects/ScopeIt && npm run typecheck`
Expected: No errors.

**Step 3: Commit**

```bash
git add web/components/AnalyticsContent.tsx
git commit -m "feat: add accuracy trend chart to analytics page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
