-- 20260208120002_enable_rls_and_policies_on_tasks.sql
BEGIN;

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Name: Enable users to view their own data only
-- Action: PERMISSIVE
-- Command: SELECT
-- Target roles: authenticated
-- USING expression: (( SELECT auth.uid() AS uid) = user_id)
CREATE POLICY "Enable users to view their own data only" ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid() AS uid) = user_id
  );

-- Name: Enable insert for users based on user_id
-- Action: PERMISSIVE
-- Command: INSERT
-- Target roles: public
-- WITH CHECK expression: (( SELECT auth.uid() AS uid) = user_id)
CREATE POLICY "Enable insert for users based on user_id" ON public.tasks
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    (SELECT auth.uid() AS uid) = user_id
  );

-- Name: Enable update for users based on user_ud
-- Action: PERMISSIVE
-- Command: UPDATE
-- Target roles: authenticated
-- USING expression: (( SELECT auth.uid() AS uid) = user_id)
CREATE POLICY "Enable update for users based on user_ud" ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid() AS uid) = user_id
  )
  WITH CHECK (
    (SELECT auth.uid() AS uid) = user_id
  );

-- Name: Enable delete for users based on user_id
-- Action: PERMISSIVE
-- Command: DELETE
-- Target roles: authenticated
-- USING expression: (( SELECT auth.uid() AS uid) = user_id)
CREATE POLICY "Enable delete for users based on user_id" ON public.tasks
  FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid() AS uid) = user_id
  );

COMMIT;