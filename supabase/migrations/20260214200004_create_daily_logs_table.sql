BEGIN;

-- Pre-aggregated daily stats for fast analytics queries.
-- Instead of scanning all tasks to compute trends, query daily_logs.
-- Populated by the app when tasks are completed (or by a cron function later).

CREATE TABLE public.daily_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  tasks_completed integer DEFAULT 0,
  total_estimated_seconds integer DEFAULT 0,
  total_actual_seconds integer DEFAULT 0,
  accuracy numeric(5,2),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily logs"
  ON public.daily_logs FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own daily logs"
  ON public.daily_logs FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own daily logs"
  ON public.daily_logs FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Index: date-range queries for trend charts
CREATE INDEX idx_daily_logs_user_date ON public.daily_logs (user_id, date DESC);

COMMIT;
