import { useAuth } from '@/contexts/AuthContext';
import { supabase, Task, TaskInsert } from '@/lib/supabase';
import { TASK_STATUS } from '@shared/constants/tasks';
import { PostgrestError } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export function useTasks() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTask = useCallback(
    async (id: string) => {
      if (!session?.user.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase.from('tasks').select().eq('id', id).maybeSingle();

      if (error) {
        setError(error);
        return { error };
      }
      setLoading(false);
      return { data };
    },
    [session?.user.id]
  );

  const addTask = useCallback(
    async (taskData: Omit<TaskInsert, 'user_id'>) => {
      if (!session?.user.id) return { data: null, error: 'No user' };

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (!error && data) {
        // Manually add to the beginning of the list
        setTasks((prev) => [data, ...prev]);
      }

      return { data, error };
    },
    [session?.user.id]
  );

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => prev.map((task) => (task.id === id ? data : task)));
    }

    return { data, error };
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (!error) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }

    return { error };
  }, []);

  /**
   * Pause a running task - accumulates elapsed time
   */
  const pauseTask = useCallback(
    async (id: string) => {
      // Get current task to calculate elapsed time
      const task = tasks.find((t) => t.id === id);
      if (!task || !task.started_at) return { error: 'Task not running' };

      const start = new Date(task.started_at).getTime();
      // Prevent negative delta
      const delta = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const newActualSeconds = (task.actual_seconds || 0) + delta;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: TASK_STATUS.PAUSED,
                started_at: null,
                actual_seconds: newActualSeconds,
              }
            : t
        )
      );

      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: TASK_STATUS.PAUSED,
          started_at: null,
          actual_seconds: newActualSeconds,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error pausing task:', error);
        await fetchTasks();
      } else if (data) {
        setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
      }

      return { data, error };
    },
    [tasks, fetchTasks]
  );

  /**
   * Start a task timer - pauses any other running task first
   */
  const startTask = useCallback(
    async (id: string) => {
      // First pause any currently running task
      const runningTask = tasks.find((t) => t.status === TASK_STATUS.RUNNING && t.id !== id);
      if (runningTask) {
        await pauseTask(runningTask.id);
      }

      const now = new Date().toISOString();

      // Optimistic update
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, status: TASK_STATUS.RUNNING, started_at: now } : task
        )
      );

      // Start this task
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: TASK_STATUS.RUNNING,
          started_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Revert on error (could be improved by refetching)
        console.error('Error starting task:', error);
        await fetchTasks();
      } else if (data) {
        setTasks((prev) => prev.map((task) => (task.id === id ? data : task)));
      }

      return { data, error };
    },
    [tasks, fetchTasks, pauseTask]
  );

  /**
   * Complete a task
   */
  const completeTask = useCallback(
    async (id: string) => {
      // Get current task to calculate final elapsed time
      const task = tasks.find((t) => t.id === id);
      if (!task) return { error: 'Task not found' };

      let finalActualSeconds = task.actual_seconds || 0;

      // If task was running, add the current session time
      if (task.status === TASK_STATUS.RUNNING && task.started_at) {
        const start = new Date(task.started_at).getTime();
        const delta = Math.max(0, Math.floor((Date.now() - start) / 1000));
        finalActualSeconds += delta;
      }

      const now = new Date().toISOString();

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: TASK_STATUS.COMPLETED,
                started_at: null,
                actual_seconds: finalActualSeconds,
                completed_at: now,
              }
            : t
        )
      );

      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: TASK_STATUS.COMPLETED,
          started_at: null,
          actual_seconds: finalActualSeconds,
          completed_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error completing task:', error);
        await fetchTasks();
      } else if (data) {
        setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
      }

      return { data, error };
    },
    [tasks, fetchTasks]
  );

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    getTask,
    startTask,
    pauseTask,
    completeTask,
    refetch: fetchTasks,
  };
}
