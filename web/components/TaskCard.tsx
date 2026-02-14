'use client';

import { useEffect, useState } from 'react';
import { Task } from '@shared/types';
import { TASK_STATUS, TaskPriorityValueName, type TaskPriorityValue } from '@shared/constants';
import { secondsToDisplay, minutesToDisplay } from '@shared/utils';
import { Play, Pause, Check, Pencil, Trash2, Clock } from 'lucide-react';
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-low-priority',
  medium: 'bg-medium-priority',
  high: 'bg-high-priority',
};

const priorityTextColors: Record<string, string> = {
  low: 'text-low-priority',
  medium: 'text-medium-priority',
  high: 'text-high-priority',
};

export function TaskCard({ task, onStart, onPause, onComplete, onDelete }: TaskCardProps) {
  const priorityName = TaskPriorityValueName[task.priority as TaskPriorityValue] || 'low';
  const isRunning = task.status === TASK_STATUS.RUNNING;
  const isCompleted = task.status === TASK_STATUS.COMPLETED;

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isRunning || !task.started_at) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, task.started_at]);

  const elapsed =
    isRunning && task.started_at
      ? (task.actual_seconds || 0) +
        Math.floor((now - new Date(task.started_at).getTime()) / 1000)
      : task.actual_seconds || 0;

  return (
    <div className="group flex items-center gap-4 rounded-xl bg-background-secondary p-4 transition hover:bg-background-tertiary">
      {/* Priority dot */}
      <div className={`h-3 w-3 shrink-0 rounded-full ${priorityColors[priorityName]}`} />

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={`truncate font-semibold ${isCompleted ? 'text-text-muted line-through' : 'text-white'}`}
          >
            {task.name}
          </h3>
          <span className="shrink-0 rounded-full bg-background-tertiary px-2.5 py-0.5 text-xs capitalize text-text-secondary">
            {task.category}
          </span>
          <span className={`shrink-0 text-xs font-medium capitalize ${priorityTextColors[priorityName]}`}>
            {priorityName}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Est: {minutesToDisplay(task.estimated_minutes)}
          </span>
          {elapsed > 0 && <span>Elapsed: {secondsToDisplay(elapsed)}</span>}
          {isRunning && (
            <span className="flex items-center gap-1 text-primary">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Running
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex shrink-0 items-center gap-1">
          {isRunning ? (
            <button
              onClick={() => onPause(task.id)}
              title="Pause"
              className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-warning"
            >
              <Pause size={16} />
            </button>
          ) : (
            <button
              onClick={() => onStart(task.id)}
              title="Start"
              className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-success"
            >
              <Play size={16} />
            </button>
          )}
          <button
            onClick={() => onComplete(task.id)}
            title="Complete"
            className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-success"
          >
            <Check size={16} />
          </button>
          <Link
            href={`/tasks/${task.id}/edit`}
            title="Edit"
            className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-primary"
          >
            <Pencil size={16} />
          </Link>
          <button
            onClick={() => onDelete(task.id)}
            title="Delete"
            className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-danger"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onDelete(task.id)}
            title="Delete"
            className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-danger"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
