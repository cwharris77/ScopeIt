import { useTaskTags as useTaskTagsHook } from '@shared/hooks/useTaskTags';
import { createContext, ReactNode, useContext } from 'react';

const TaskTagsContext = createContext<ReturnType<typeof useTaskTagsHook> | null>(null);

export function TaskTagsProvider({ children }: { children: ReactNode }) {
  const taskTagsValue = useTaskTagsHook();
  return <TaskTagsContext.Provider value={taskTagsValue}>{children}</TaskTagsContext.Provider>;
}

export function useTaskTags() {
  const context = useContext(TaskTagsContext);
  if (!context) {
    throw new Error('useTaskTags must be used within TaskTagsProvider');
  }
  return context;
}
