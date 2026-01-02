export type TaskURLParams = {
  name: string;
  id: string;
  priority: TaskPriorityName;
};

export const TaskPriority = {
  low: 1,
  medium: 5,
  high: 10,
} as const;

export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];
export type TaskPriorityName = keyof typeof TaskPriority;

export const TaskPriorityValueName: Record<TaskPriorityType, TaskPriorityName> = {
  [TaskPriority.low]: 'low',
  [TaskPriority.medium]: 'medium',
  [TaskPriority.high]: 'high',
};
