'use client';

import { createClient } from '@/lib/supabase/client';
import { Task } from '@shared/types';
import { TASK_STATUS } from '@shared/constants';
import { secondsToDisplay } from '@shared/utils';
import { calculatePerTaskAccuracy } from '@shared/utils/accuracy';
import { useCallback, useEffect, useState } from 'react';
import { StatsCards } from './StatsCards';
import { PerformanceChart } from './PerformanceChart';
import { AiInsights } from './AiInsights';

export default function AnalyticsContent() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED);
  const totalSeconds = completedTasks.reduce((sum, t) => sum + (t.actual_seconds || 0), 0);
  const accuracy = calculatePerTaskAccuracy(completedTasks);

  if (loading) {
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
      <PerformanceChart tasks={completedTasks.slice(0, 5)} />
      <AiInsights tasks={completedTasks} />
    </div>
  );
}
