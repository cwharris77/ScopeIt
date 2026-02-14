'use client';

import { createClient } from '@/lib/supabase/client';
import { Task, TaskInsert } from '@shared/types';
import {
  CATEGORIES,
  TASK_STATUS,
  type SortOption,
} from '@shared/constants';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskCard } from '@/components/TaskCard';
import { FilterBar } from '@/components/FilterBar';
import { AddTaskModal } from '@/components/AddTaskModal';
import { Plus } from 'lucide-react';

export function TasksPageContent() {
  const supabase = createClient();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTasks = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setTasks(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter and sort logic
  const filterTasks = (taskList: Task[]) => {
    let filtered = taskList;
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((t) => selectedCategories.has(t.category));
    }
    return sortTasks(filtered);
  };

  const sortTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'duration':
          return (b.estimated_minutes || 0) - (a.estimated_minutes || 0);
        default:
          return 0;
      }
    });
  };

  const activeTasks = filterTasks(tasks.filter((t) => t.status !== TASK_STATUS.COMPLETED));
  const completedTasks = filterTasks(tasks.filter((t) => t.status === TASK_STATUS.COMPLETED));

  // Task actions
  const startTask = async (id: string) => {
    const running = tasks.find((t) => t.status === TASK_STATUS.RUNNING && t.id !== id);
    if (running) await pauseTask(running.id);

    const now = new Date().toISOString();
    await supabase
      .from('tasks')
      .update({ status: TASK_STATUS.RUNNING, started_at: now })
      .eq('id', id);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: TASK_STATUS.RUNNING, started_at: now } : t))
    );
  };

  const pauseTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task?.started_at) return;
    const delta = Math.max(
      0,
      Math.floor((Date.now() - new Date(task.started_at).getTime()) / 1000)
    );
    const newSeconds = (task.actual_seconds || 0) + delta;

    await supabase
      .from('tasks')
      .update({ status: TASK_STATUS.PAUSED, started_at: null, actual_seconds: newSeconds })
      .eq('id', id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: TASK_STATUS.PAUSED, started_at: null, actual_seconds: newSeconds }
          : t
      )
    );
  };

  const completeTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    let finalSeconds = task.actual_seconds || 0;
    if (task.status === TASK_STATUS.RUNNING && task.started_at) {
      finalSeconds += Math.max(
        0,
        Math.floor((Date.now() - new Date(task.started_at).getTime()) / 1000)
      );
    }
    const now = new Date().toISOString();

    await supabase
      .from('tasks')
      .update({
        status: TASK_STATUS.COMPLETED,
        started_at: null,
        actual_seconds: finalSeconds,
        completed_at: now,
      })
      .eq('id', id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: TASK_STATUS.COMPLETED,
              started_at: null,
              actual_seconds: finalSeconds,
              completed_at: now,
            }
          : t
      )
    );
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = async (taskData: Omit<TaskInsert, 'user_id'>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('tasks')
      .insert({ ...taskData, user_id: user.id })
      .select()
      .single();
    if (data) setTasks((prev) => [data, ...prev]);
    setShowAddModal(false);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories(new Set());
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-light"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      <FilterBar
        categories={CATEGORIES}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        onClearFilters={handleClearFilters}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* Active Tasks */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Active ({activeTasks.length})
        </h2>
        {activeTasks.length === 0 ? (
          <p className="rounded-xl bg-background-secondary p-6 text-center text-sm text-text-muted">
            No active tasks. Add one to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStart={startTask}
                onPause={pauseTask}
                onComplete={completeTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Completed ({completedTasks.length})
          </h2>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStart={startTask}
                onPause={pauseTask}
                onComplete={completeTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </section>
      )}

      <AddTaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addTask} />
    </div>
  );
}
