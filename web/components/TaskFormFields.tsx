'use client';

import { useRef } from 'react';
import { TaskPriority, type TaskPriorityName } from '@shared/constants';
import { Tag } from '@shared/types';
import { TagCreatePopover } from './TagCreatePopover';

interface TaskFormFieldsProps {
  tags: Tag[];
  selectedTagIds: Set<string>;
  onTagsChange: (tags: Tag[]) => void;
  onSelectedTagIdsChange: (ids: Set<string>) => void;
  priority: number;
  onPriorityChange: (priority: number) => void;
  hoursStr: string;
  onHoursChange: (hours: string) => void;
  minutesStr: string;
  onMinutesChange: (minutes: string) => void;
}

const priorityColors: Record<TaskPriorityName, string> = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-danger',
};

export function TaskFormFields({
  tags,
  selectedTagIds,
  onTagsChange,
  onSelectedTagIdsChange,
  priority,
  onPriorityChange,
  hoursStr,
  onHoursChange,
  minutesStr,
  onMinutesChange,
}: TaskFormFieldsProps) {
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Tags */}
      <div>
        <label className="text-text-secondary mb-2 block text-sm">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.has(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  onSelectedTagIdsChange(
                    (() => {
                      const next = new Set(selectedTagIds);
                      if (next.has(tag.id)) next.delete(tag.id);
                      else next.add(tag.id);
                      return next;
                    })()
                  );
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
          <TagCreatePopover
            onTagCreated={(tag) => {
              onTagsChange([...tags, tag].sort((a, b) => a.name.localeCompare(b.name)));
              onSelectedTagIdsChange(new Set([...selectedTagIds, tag.id]));
            }}
          />
        </div>
      </div>

      {/* Priority */}
      <div className="flex w-full flex-col">
        <label className="text-text-secondary mb-2 block text-sm">Priority</label>
        <div className="flex justify-center gap-2">
          {(Object.entries(TaskPriority) as [TaskPriorityName, number][]).map(([pName, pValue]) => (
            <button
              key={pName}
              type="button"
              onClick={() => onPriorityChange(pValue)}
              className={`w-1/3 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                priority === pValue
                  ? `${priorityColors[pName]} text-white`
                  : 'bg-background-tertiary text-text-secondary hover:text-white'
              }`}>
              {pName}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="text-text-secondary mb-2 block text-sm">Estimated Duration</label>
        <div className="flex gap-3">
          <div
            onClick={() => hoursRef.current?.focus()}
            className="border-border flex flex-1 cursor-text flex-col items-center rounded-xl border bg-background px-3 py-2">
            <span className="text-text-muted text-xs uppercase tracking-wide">Hours</span>
            <input
              ref={hoursRef}
              type="text"
              inputMode="numeric"
              value={hoursStr}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                onHoursChange(v);
              }}
              onBlur={() => onHoursChange(String(parseInt(hoursStr) || 0))}
              className="w-25 bg-transparent text-center text-3xl font-bold text-white outline-none"
            />
          </div>
          <div
            onClick={() => minutesRef.current?.focus()}
            className="border-border flex flex-1 cursor-text flex-col items-center rounded-xl border bg-background px-3 py-2">
            <span className="text-text-muted text-xs uppercase tracking-wide">Minutes</span>
            <input
              ref={minutesRef}
              type="text"
              inputMode="numeric"
              value={minutesStr}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                if (v === '' || parseInt(v) <= 59) onMinutesChange(v);
              }}
              onBlur={() => onMinutesChange(String(parseInt(minutesStr) || 0))}
              className="w-25 bg-transparent text-center text-3xl font-bold text-white outline-none"
            />
          </div>
        </div>
      </div>
    </>
  );
}
