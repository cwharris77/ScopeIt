import { useAuth } from '@/contexts/AuthContext';
import { Project, ProjectInsert, supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export function useProjects() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = useCallback(
    async (projectData: Omit<ProjectInsert, 'user_id'>) => {
      if (!session?.user.id) return { data: null, error: 'No user' };

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (!error && data) {
        setProjects((prev) => [data, ...prev]);
      }

      return { data, error };
    },
    [session?.user.id]
  );

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      if (data.archived) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
      }
    }

    return { data, error };
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }

    return { error };
  }, []);

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
