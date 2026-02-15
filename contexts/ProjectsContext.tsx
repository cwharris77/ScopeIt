import { useProjects as useProjectsHook } from '@/shared/hooks/useProjects';
import { createContext, ReactNode, useContext } from 'react';

const ProjectsContext = createContext<ReturnType<typeof useProjectsHook> | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const projectsValue = useProjectsHook();
  return <ProjectsContext.Provider value={projectsValue}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider');
  }
  return context;
}
