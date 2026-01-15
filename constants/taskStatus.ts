/**
 * Task status constants matching web app
 */

export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed';

export const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

export const CATEGORIES = ['work', 'coding', 'design', 'meeting', 'personal'] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ALL = 'All' as const;

export type SortOption = 'newest' | 'oldest' | 'duration';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'duration', label: 'Longest Duration' },
];
