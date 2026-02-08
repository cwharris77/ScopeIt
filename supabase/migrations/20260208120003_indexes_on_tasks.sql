-- 20260208120003_indexes_on_tasks.sql
BEGIN;

-- Helpful indexes referenced by best practices (index columns used in RLS/predicates)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

COMMIT;