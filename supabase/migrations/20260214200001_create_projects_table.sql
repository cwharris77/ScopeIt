BEGIN;

-- Projects allow users to group related tasks (sprints, courses, client work, etc.)

CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#087f8c',
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Index: list projects for a user
CREATE INDEX idx_projects_user ON public.projects (user_id);

-- Add optional project_id to tasks
ALTER TABLE public.tasks
  ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Index: list tasks within a project
CREATE INDEX idx_tasks_project ON public.tasks (project_id) WHERE project_id IS NOT NULL;

COMMIT;
