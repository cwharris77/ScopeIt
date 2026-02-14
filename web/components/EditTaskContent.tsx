'use client';

import { createClient } from '@/lib/supabase/client';
import { Tag, Task } from '@shared/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { TaskFormFields } from './TaskFormFields';

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
  const [hoursStr, setHoursStr] = useState('0');
  const [minutesStr, setMinutesStr] = useState('30');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  const fetchTask = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (data) {
      setTask(data);
      setName(data.name);
      setDescription(data.description || '');
      setPriority(data.priority);
      setHoursStr(String(Math.floor(data.estimated_minutes / 60)));
      setMinutesStr(String(data.estimated_minutes % 60));

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
    const estimated_minutes = (parseInt(hoursStr) || 0) * 60 + (parseInt(minutesStr) || 0);

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

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="text-text-secondary mb-6 flex items-center gap-2 transition hover:text-white">
        <ArrowLeft size={20} />
        Back to tasks
      </Link>

      <div className="bg-background-secondary space-y-8 rounded-xl p-6">
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

        <TaskFormFields
          tags={allTags}
          selectedTagIds={selectedTagIds}
          onTagsChange={setAllTags}
          onSelectedTagIdsChange={setSelectedTagIds}
          priority={priority}
          onPriorityChange={setPriority}
          hoursStr={hoursStr}
          onHoursChange={setHoursStr}
          minutesStr={minutesStr}
          onMinutesChange={setMinutesStr}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2 justify-center">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="hover:bg-primary-dark rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition disabled:opacity-50 w-1/3">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/"
            className="border-border text-text-secondary rounded-lg border px-6 py-2.5 transition hover:text-white w-1/3 flex items-center justify-center">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
