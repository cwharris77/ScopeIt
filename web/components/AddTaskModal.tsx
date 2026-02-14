'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TaskPriority, type TaskPriorityName } from '@shared/constants';
import { Tag, TaskInsert } from '@shared/types';
import { X } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<TaskInsert, 'user_id'>, tagIds: string[]) => void;
}

const priorities: { name: TaskPriorityName; value: number; color: string }[] = [
  { name: 'low', value: TaskPriority.low, color: 'bg-low-priority' },
  { name: 'medium', value: TaskPriority.medium, color: 'bg-medium-priority' },
  { name: 'high', value: TaskPriority.high, color: 'bg-high-priority' },
];

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<number>(TaskPriority.low);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPriority(TaskPriority.low);
      setHours(0);
      setMinutes(30);
      setSelectedTagIds(new Set());
      setTimeout(() => nameRef.current?.focus(), 100);

      const fetchTags = async () => {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('tags')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
        setTags(data || []);
      };
      fetchTags();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const estimatedMinutes = hours * 60 + minutes;
    onAdd(
      {
        name: name.trim(),
        priority,
        estimated_minutes: estimatedMinutes,
        status: 'pending',
      },
      Array.from(selectedTagIds)
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}>
      <div className="bg-background-secondary w-full max-w-md rounded-2xl p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Add Task</h2>
          <button
            onClick={onClose}
            className="text-text-secondary rounded-lg p-1 transition hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">
              Task Name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What needs to be done?"
              className="border-border placeholder-text-muted w-full rounded-lg border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
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
              {tags.length === 0 && (
                <p className="text-text-muted text-xs">
                  No tags yet. Create tags from the Tags page.
                </p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                    priority === p.value
                      ? `${p.color} text-white`
                      : 'bg-background-tertiary text-text-secondary hover:text-white'
                  }`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">
              Estimated Duration
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border-border w-16 rounded-lg border bg-background px-2 py-2 text-center text-sm text-white outline-none focus:border-primary"
                />
                <span className="text-text-muted text-sm">hrs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border-border w-16 rounded-lg border bg-background px-2 py-2 text-center text-sm text-white outline-none focus:border-primary"
                />
                <span className="text-text-muted text-sm">min</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="hover:bg-primary-light w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition">
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}
