import { TaskPriority, TaskPriorityType } from '@/types/tasks';

export function parseTaskPriorityValue(value: unknown): TaskPriorityType | null {
  const num = Number(value);

  if (num === TaskPriority.low || num === TaskPriority.medium || num === TaskPriority.high) {
    return num;
  }

  return null;
}
