import { useAuth } from '@/contexts/AuthContext';
import { supabase, Tag, TagInsert, TagUpdate } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export function useTags() {
  const { session } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchTags = useCallback(async () => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', session.user.id)
      .order('name', { ascending: true });

    if (error) {
      setError(error);
    } else {
      setTags(data || []);
    }
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = useCallback(
    async (tagData: Omit<TagInsert, 'user_id'>) => {
      if (!session?.user.id) return { data: null, error: 'No user' };

      const { data, error } = await supabase
        .from('tags')
        .insert({ ...tagData, user_id: session.user.id })
        .select()
        .single();

      if (!error && data) {
        setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      }

      return { data, error };
    },
    [session?.user.id]
  );

  const updateTag = useCallback(async (id: string, updates: TagUpdate) => {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setTags((prev) =>
        prev.map((t) => (t.id === id ? data : t)).sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    return { data, error };
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id);

    if (!error) {
      setTags((prev) => prev.filter((t) => t.id !== id));
    }

    return { error };
  }, []);

  return {
    tags,
    loading,
    error,
    addTag,
    updateTag,
    deleteTag,
    refetch: fetchTags,
  };
}
