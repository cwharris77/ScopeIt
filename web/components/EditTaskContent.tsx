'use client';

import { createClient } from '@/lib/supabase/client';
import { TaskPriority, type TaskPriorityName } from '@shared/constants';
import { Tag, Task } from '@shared/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function EditTaskContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(1);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  const fetchTask = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (data) {
      setTask(data);
      setName(data.name);
      setDescription(data.description || '');
      setPriority(data.priority);
      setHours(Math.floor(data.estimated_minutes / 60));
      setMinutes(data.estimated_minutes % 60);

      // Fetch all tags for the user
      const { data: tagsData } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', data.user_id)
        .order('name');
      setAllTags(tagsData || []);

      // Fetch current task's tags
      const { data: taskTagsData } = await supabase
        .from('task_tags')
        .select('tag_id')
        .eq('task_id', id);
      setSelectedTagIds(new Set(taskTagsData?.map((tt) => tt.tag_id) || []));
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
    void fetchTask();
  }, [fetchTask]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    const estimated_minutes = hours * 60 + minutes;

    await supabase
      .from('tasks')
      .update({
        name,
        description: description || null,
        priority,
        estimated_minutes,
      })
      .eq('id', task.id);

    // Update tag assignments
    await supabase.from('task_tags').delete().eq('task_id', task.id);
    const tagIds = Array.from(selectedTagIds);
    if (tagIds.length > 0) {
      await supabase
        .from('task_tags')
        .insert(tagIds.map((tagId) => ({ task_id: task.id, tag_id: tagId })));
    }

    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-danger">Task not found</p>
      </div>
    );
  }

  const priorityColors: Record<TaskPriorityName, string> = {
    low: 'bg-success',
    medium: 'bg-warning',
    high: 'bg-danger',
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="text-text-secondary mb-6 flex items-center gap-2 transition hover:text-white">
        <ArrowLeft size={20} />
        Back to tasks
      </Link>

      <div className="bg-background-secondary space-y-6 rounded-xl p-6">
        <h1 className="text-xl font-bold text-white">Edit Task</h1>

        {/* Name */}
        <div>
          <label className="text-text-secondary mb-1 block text-sm">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-border w-full rounded-lg border bg-background p-3 text-white focus:border-primary focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-text-secondary mb-1 block text-sm">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="border-border w-full resize-none rounded-lg border bg-background p-3 text-white focus:border-primary focus:outline-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-text-secondary mb-2 block text-sm">Tags</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = selectedTagIds.has(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTagIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(tag.id)) next.delete(tag.id);
                      else next.add(tag.id);
                      return next;
                    });
                  }}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                    isSelected
                      ? 'text-white'
                      : 'bg-background-tertiary text-text-secondary hover:text-white'
                  }`}
                  style={isSelected ? { backgroundColor: tag.color || '#087f8c' } : undefined}>
                  {tag.name}
                </button>
              );
            })}
            {}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-text-secondary mb-2 block text-sm">Priority</label>
          <div className="flex gap-2">
            {(Object.entries(TaskPriority) as [TaskPriorityName, number][]).map(
              ([pName, pValue]) => (
                <button
                  key={pName}
                  onClick={() => setPriority(pValue)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                    priority === pValue
                      ? `${priorityColors[pName]} text-white`
                      : 'bg-background-tertiary text-text-secondary hover:text-white'
                  }`}>
                  {pName}
                </button>
              )
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-text-secondary mb-2 block text-sm">Estimated Duration</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                className="border-border w-20 rounded-lg border bg-background p-3 text-center text-white focus:border-primary focus:outline-none"
              />
              <span className="text-text-secondary text-sm">hrs</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="border-border w-20 rounded-lg border bg-background p-3 text-center text-white focus:border-primary focus:outline-none"
              />
              <span className="text-text-secondary text-sm">min</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="hover:bg-primary-dark rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/"
            className="border-border text-text-secondary rounded-lg border px-6 py-2.5 transition hover:text-white">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
