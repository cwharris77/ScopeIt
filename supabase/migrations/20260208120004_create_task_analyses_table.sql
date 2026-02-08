BEGIN;

CREATE TABLE public.task_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis jsonb NOT NULL,
  completed_count integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.task_analyses ENABLE ROW LEVEL SECURITY;

-- Users can read their own analyses
CREATE POLICY "Enable users to view their own analyses" ON public.task_analyses
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid() AS uid) = user_id
  );

-- Users can insert their own analyses
CREATE POLICY "Enable insert for users based on user_id" ON public.task_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid() AS uid) = user_id
  );

COMMIT;