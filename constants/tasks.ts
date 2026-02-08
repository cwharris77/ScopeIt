/**
 * Task constants and derived types
 */

// --- Status ---

export const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// --- Categories ---

export const CATEGORIES = ['work', 'coding', 'design', 'meeting', 'personal'] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ALL = 'All' as const;

// --- Priority ---

export const TaskPriority = {
  low: 1,
  medium: 5,
  high: 10,
} as const;

export type TaskPriorityValue = (typeof TaskPriority)[keyof typeof TaskPriority];
export type TaskPriorityName = keyof typeof TaskPriority;

export const TaskPriorityValueName: Record<TaskPriorityValue, TaskPriorityName> = {
  [TaskPriority.low]: 'low',
  [TaskPriority.medium]: 'medium',
  [TaskPriority.high]: 'high',
};

export const PRIORITY_OPTIONS: { value: TaskPriorityName; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// --- URL Params ---

export type TaskURLParams = {
  name: string;
  id: string;
  priority: TaskPriorityName;
};

// --- Sort ---

export type SortOption = 'newest' | 'oldest' | 'duration';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'duration', label: 'Longest Duration' },
];
