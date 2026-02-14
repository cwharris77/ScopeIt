'use client';

import { createClient } from '@/lib/supabase/client';
import { Task } from '@shared/types';
import {
  CATEGORIES,
  TaskPriority,
  TaskPriorityValueName,
  type TaskPriorityName,
} from '@shared/constants';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState<number>(1);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);

  const fetchTask = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (data) {
      setTask(data);
      setName(data.name);
      setDescription(data.description || '');
      setCategory(data.category);
      setPriority(data.priority);
      setHours(Math.floor(data.estimated_minutes / 60));
      setMinutes(data.estimated_minutes % 60);
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchTask();
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
        category,
        priority,
        estimated_minutes,
      })
      .eq('id', task.id);

    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-danger">Task not found</p>
      </div>
    );
  }

  const priorityName =
    TaskPriorityValueName[priority as keyof typeof TaskPriorityValueName] || 'low';
  const priorityColors: Record<TaskPriorityName, string> = {
    low: 'bg-success',
    medium: 'bg-warning',
    high: 'bg-danger',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition"
      >
        <ArrowLeft size={20} />
        Back to tasks
      </Link>

      <div className="rounded-xl bg-background-secondary p-6 space-y-6">
        <h1 className="text-xl font-bold text-white">Edit Task</h1>

        {/* Name */}
        <div>
          <label className="text-sm text-text-secondary mb-1 block">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-background p-3 text-white border border-border focus:border-primary focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm text-text-secondary mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-background p-3 text-white border border-border focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm text-text-secondary mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition capitalize ${
                  category === cat
                    ? 'bg-primary text-white'
                    : 'bg-background-tertiary text-text-secondary hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm text-text-secondary mb-2 block">Priority</label>
          <div className="flex gap-2">
            {(Object.entries(TaskPriority) as [TaskPriorityName, number][]).map(
              ([pName, pValue]) => (
                <button
                  key={pName}
                  onClick={() => setPriority(pValue)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition capitalize ${
                    priority === pValue
                      ? `${priorityColors[pName]} text-white`
                      : 'bg-background-tertiary text-text-secondary hover:text-white'
                  }`}
                >
                  {pName}
                </button>
              )
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm text-text-secondary mb-2 block">Estimated Duration</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg bg-background p-3 text-white border border-border focus:border-primary focus:outline-none text-center"
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
                className="w-20 rounded-lg bg-background p-3 text-white border border-border focus:border-primary focus:outline-none text-center"
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
            className="rounded-lg bg-primary px-6 py-2.5 text-white font-semibold hover:bg-primary-dark transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border px-6 py-2.5 text-text-secondary hover:text-white transition"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
