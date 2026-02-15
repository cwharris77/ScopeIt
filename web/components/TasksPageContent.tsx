'use client';

import { AddTaskModal } from '@/components/AddTaskModal';
import { FilterBar } from '@/components/FilterBar';
import { TaskCard } from '@/components/TaskCard';
import { TASK_STATUS, type SortOption } from '@shared/constants';
import { useTags } from '@shared/hooks/useTags';
import { useTasks } from '@shared/hooks/useTasks';
import { useTaskTags } from '@shared/hooks/useTaskTags';
import { Task, TaskInsert } from '@shared/types';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function TasksPageContent() {
  const {
    tasks,
    loading: tasksLoading,
    addTask: sharedAddTask,
    startTask,
    pauseTask,
    completeTask,
    deleteTask,
  } = useTasks();

  const { tags, loading: tagsLoading } = useTags();
  const { tagsByTaskId, setTaskTags, loading: taskTagsLoading } = useTaskTags();

  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showAddModal, setShowAddModal] = useState(false);

  const loading = tasksLoading || tagsLoading || taskTagsLoading;

  // Filter and sort logic
  const filterTasks = (taskList: Task[]) => {
    let filtered = taskList;
    if (selectedTagIds.size > 0) {
      filtered = filtered.filter((t) => {
        const taskTags = tagsByTaskId.get(t.id) || [];
        return taskTags.some((tag) => selectedTagIds.has(tag.id));
      });
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

  const addTask = async (taskData: Omit<TaskInsert, 'user_id'>, tagIds: string[] = []) => {
    const { data } = await sharedAddTask(taskData);
    if (data && tagIds.length > 0) {
      await setTaskTags(data.id, tagIds);
    }
    setShowAddModal(false);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  if (loading && tasks.length === 0) {
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
          className="hover:bg-primary-light flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition">
          <Plus size={18} />
          Add Task
        </button>
      </div>

      <FilterBar
        tags={tags}
        selectedTagIds={selectedTagIds}
        onTagToggle={handleTagToggle}
        onClearFilters={() => setSelectedTagIds(new Set())}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* Active Tasks */}
      <section className="mt-6">
        <h2 className="text-text-muted mb-3 text-sm font-semibold uppercase tracking-wider">
          Active ({activeTasks.length})
        </h2>
        {activeTasks.length === 0 ? (
          <p className="bg-background-secondary text-text-muted rounded-xl p-6 text-center text-sm">
            No active tasks. Add one to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                tags={tagsByTaskId.get(task.id)}
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
          <h2 className="text-text-muted mb-3 text-sm font-semibold uppercase tracking-wider">
            Completed ({completedTasks.length})
          </h2>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                tags={tagsByTaskId.get(task.id)}
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
