'use client';

import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, TaskPriority, type TaskPriorityName } from '@shared/constants';
import { TaskInsert } from '@shared/types';
import { X } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<TaskInsert, 'user_id'>) => void;
}

const priorities: { name: TaskPriorityName; value: number; color: string }[] = [
  { name: 'low', value: TaskPriority.low, color: 'bg-low-priority' },
  { name: 'medium', value: TaskPriority.medium, color: 'bg-medium-priority' },
  { name: 'high', value: TaskPriority.high, color: 'bg-high-priority' },
];

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('work');
  const [priority, setPriority] = useState<number>(TaskPriority.low);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('work');
      setPriority(TaskPriority.low);
      setHours(0);
      setMinutes(30);
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const estimatedMinutes = hours * 60 + minutes;
    onAdd({
      name: name.trim(),
      category,
      priority,
      estimated_minutes: estimatedMinutes,
      status: 'pending',
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-2xl bg-background-secondary p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Add Task</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary transition hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Task Name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder-text-muted outline-none focus:border-primary"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition ${
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
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Priority
            </label>
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
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
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
                  className="w-16 rounded-lg border border-border bg-background px-2 py-2 text-center text-sm text-white outline-none focus:border-primary"
                />
                <span className="text-sm text-text-muted">hrs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 rounded-lg border border-border bg-background px-2 py-2 text-center text-sm text-white outline-none focus:border-primary"
                />
                <span className="text-sm text-text-muted">min</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}
