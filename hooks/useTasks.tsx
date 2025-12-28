import { useAuth } from '@/contexts/AuthContext';
import { supabase, Task, TaskInsert } from '@/lib/supabase';
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

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks, // Expose refetch for manual refresh
  };
}
