BEGIN;

-- User-defined tags replace the hardcoded category column over time.
-- Many-to-many relationship via task_tags join table.

CREATE TABLE public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6b7280',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, name)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tags"
  ON public.tags FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own tags"
  ON public.tags FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own tags"
  ON public.tags FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own tags"
  ON public.tags FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_tags_user ON public.tags (user_id);

-- Join table: which tags belong to which tasks
CREATE TABLE public.task_tags (
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (task_id, tag_id)
);

ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- RLS via join: user owns the task
CREATE POLICY "Users can view tags on their own tasks"
  ON public.task_tags FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_id AND tasks.user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Users can tag their own tasks"
  ON public.task_tags FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_id AND tasks.user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Users can untag their own tasks"
  ON public.task_tags FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_id AND tasks.user_id = (SELECT auth.uid()))
  );

CREATE INDEX idx_task_tags_tag ON public.task_tags (tag_id);

COMMIT;
