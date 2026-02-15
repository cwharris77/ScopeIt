import { useTags as useTagsHook } from '@/shared/hooks/useTags';
import { createContext, ReactNode, useContext } from 'react';

const TagsContext = createContext<ReturnType<typeof useTagsHook> | null>(null);

export function TagsProvider({ children }: { children: ReactNode }) {
  const tagsValue = useTagsHook();
  return <TagsContext.Provider value={tagsValue}>{children}</TagsContext.Provider>;
}

export function useTags() {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within TagsProvider');
  }
  return context;
}
