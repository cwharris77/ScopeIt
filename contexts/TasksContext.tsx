import { useTasks as useTasksHook } from '@/hooks/useTasks';
import { createContext, ReactNode, useContext } from 'react';

const TasksContext = createContext<ReturnType<typeof useTasksHook> | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const tasksValue = useTasksHook();
  return <TasksContext.Provider value={tasksValue}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
}
