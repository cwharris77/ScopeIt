-- Performance indexes for existing tables.
-- These cover the most common query patterns in the app.

-- Main task list: fetched on every app open, filtered by user + status
CREATE INDEX idx_tasks_user_status ON public.tasks (user_id, status);

-- Analytics: completed tasks sorted by completion date (weekly trends, rolling accuracy)
CREATE INDEX idx_tasks_user_completed ON public.tasks (user_id, completed_at DESC)
  WHERE completed_at IS NOT NULL;

-- AI analysis cache lookup: most recent analysis per user
CREATE INDEX idx_task_analyses_user_created ON public.task_analyses (user_id, created_at DESC);
