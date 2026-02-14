BEGIN;

-- Templates let users save reusable task blueprints with pre-filled estimates.
-- use_count tracks popularity so the most-used templates surface first.

CREATE TABLE public.templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  estimated_minutes integer NOT NULL,
  category text,
  priority integer DEFAULT 1,
  use_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates"
  ON public.templates FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own templates"
  ON public.templates FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.templates FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.templates FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Index: list templates for a user, most used first
CREATE INDEX idx_templates_user ON public.templates (user_id, use_count DESC);

COMMIT;
