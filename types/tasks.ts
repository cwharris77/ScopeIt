export type TaskURLParams = {
  name: string;
  id: string;
  priority: TaskPriorityName;
};

export const TaskPriority = {
  low: 0,
  medium: 5,
  high: 10,
} as const;

export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];
export type TaskPriorityName = keyof typeof TaskPriority;

export const TaskPriorityNameColor: Record<TaskPriorityName, string> = {
  low: '$low_priority',
  medium: '$medium_priority',
  high: '$high_priority',
};
