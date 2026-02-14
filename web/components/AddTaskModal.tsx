'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TaskPriority } from '@shared/constants';
import { Tag, TaskInsert } from '@shared/types';
import { X } from 'lucide-react';
import { TaskFormFields } from './TaskFormFields';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<TaskInsert, 'user_id'>, tagIds: string[]) => void;
}

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(TaskPriority.low);
  const [hoursStr, setHoursStr] = useState('0');
  const [minutesStr, setMinutesStr] = useState('30');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form state when modal opens
    setName('');
    setDescription('');
    setPriority(TaskPriority.low);
    setHoursStr('0');
    setMinutesStr('30');
    setSelectedTagIds(new Set());
    setTimeout(() => nameRef.current?.focus(), 100);

    const fetchTags = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('tags').select('*').eq('user_id', user.id).order('name');
      setTags(data || []);
    };
    void fetchTags();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const estimatedMinutes = (parseInt(hoursStr) || 0) * 60 + (parseInt(minutesStr) || 0);
    onAdd(
      {
        name: name.trim(),
        description: description.trim() || null,
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

          {/* Description */}
          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              rows={3}
              className="border-border placeholder-text-muted w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
            />
          </div>

          <TaskFormFields
            tags={tags}
            selectedTagIds={selectedTagIds}
            onTagsChange={setTags}
            onSelectedTagIdsChange={setSelectedTagIds}
            priority={priority}
            onPriorityChange={setPriority}
            hoursStr={hoursStr}
            onHoursChange={setHoursStr}
            minutesStr={minutesStr}
            onMinutesChange={setMinutesStr}
          />

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
