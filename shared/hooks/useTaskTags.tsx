import { useAuth } from '@/contexts/AuthContext';
import { supabase, Tag } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export function useTaskTags() {
  const { session } = useAuth();
  const [tagsByTaskId, setTagsByTaskId] = useState<Map<string, Tag[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchTaskTags = useCallback(async () => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get user's task IDs
    const { data: taskRows } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', session.user.id);

    const taskIds = taskRows?.map((t) => t.id) || [];

    if (taskIds.length === 0) {
      setTagsByTaskId(new Map());
      setLoading(false);
      return;
    }

    // Fetch all task_tags joined with tags
    const { data, error } = await supabase
      .from('task_tags')
      .select('task_id, tags(*)')
      .in('task_id', taskIds);

    if (!error && data) {
      const map = new Map<string, Tag[]>();
      for (const row of data) {
        const taskId = row.task_id;
        const tag = row.tags as unknown as Tag;
        if (!tag) continue;
        if (!map.has(taskId)) map.set(taskId, []);
        map.get(taskId)!.push(tag);
      }
      setTagsByTaskId(map);
    }
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    fetchTaskTags();
  }, [fetchTaskTags]);

  const setTaskTags = useCallback(
    async (taskId: string, tagIds: string[]) => {
      // Delete existing tags for this task
      await supabase.from('task_tags').delete().eq('task_id', taskId);

      // Insert new tag assignments
      if (tagIds.length > 0) {
        await supabase
          .from('task_tags')
          .insert(tagIds.map((tagId) => ({ task_id: taskId, tag_id: tagId })));
      }

      // Refetch to get updated state
      await fetchTaskTags();
    },
    [fetchTaskTags]
  );

  const getTagsForTask = useCallback(
    (taskId: string): Tag[] => {
      return tagsByTaskId.get(taskId) || [];
    },
    [tagsByTaskId]
  );

  return {
    tagsByTaskId,
    loading,
    setTaskTags,
    getTagsForTask,
    refetch: fetchTaskTags,
  };
}
