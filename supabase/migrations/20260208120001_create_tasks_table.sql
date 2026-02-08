-- 20260208120001_create_tasks_table.sql
BEGIN;

CREATE SCHEMA IF NOT EXISTS public;

-- Create table `tasks`
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  priority integer NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'work'::text,
  status text DEFAULT 'pending'::text,
  estimated_minutes integer,
  actual_seconds integer DEFAULT 0,
  user_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

-- Foreign key to auth.users
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id)
  REFERENCES auth.users (id) ON DELETE SET NULL;

COMMIT;