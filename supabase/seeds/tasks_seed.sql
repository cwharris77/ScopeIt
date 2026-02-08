-- seeds/tasks_seed.sql
-- Realistic sample data for `public.tasks`
-- Replace the user_id UUIDs below with real auth user IDs if desired.

INSERT INTO public.tasks (id, name, description, priority, category, status, estimated_minutes, actual_seconds, user_id, started_at, completed_at, created_at)
VALUES
  -- User A (product manager)
  ('b1a5f9d2-1111-4f9a-9a1a-000000000001', 'Plan Q2 roadmap', 'Outline key initiatives for Q2', 2, 'work', 'in_progress', 120, 3600, '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '3 days', NULL, NOW() - INTERVAL '3 days'),
  ('b1a5f9d2-1111-4f9a-9a1a-000000000002', 'User interviews', 'Interview 6 users about onboarding', 3, 'research', 'pending', 180, 0, '11111111-1111-4111-8111-111111111111', NULL, NULL, NOW() - INTERVAL '2 days'),

  -- User B (engineer)
  ('b1a5f9d2-2222-4f9a-9a1a-000000000003', 'Implement auth middleware', 'Add token verification and user context', 1, 'work', 'pending', 240, 0, '22222222-2222-4222-8222-222222222222', NULL, NULL, NOW() - INTERVAL '5 days'),
  ('b1a5f9d2-2222-4f9a-9a1a-000000000004', 'Refactor task service', 'Break into smaller modules and add tests', 2, 'engineering', 'in_progress', 300, 1800, '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '1 day', NULL, NOW() - INTERVAL '1 day'),

  -- User C (designer)
  ('b1a5f9d2-3333-4f9a-9a1a-000000000005', 'Design onboarding screens', 'Create high-fidelity mocks for new onboarding', 2, 'design', 'completed', 90, 5400, '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '8 days'),

  -- Misc / low-priority tasks
  ('b1a5f9d2-4444-4f9a-9a1a-000000000006', 'Clean up old branches', 'Delete stale branches and update PRs', 5, 'maintenance', 'pending', 60, 0, '22222222-2222-4222-8222-222222222222', NULL, NULL, NOW() - INTERVAL '10 hours');

-- Note: If inserting as an admin (service_role) into a DB with RLS enabled, inserts bypass RLS.
-- If running seeds as an authenticated user, ensure the WITH CHECK policy is satisfied: the user_id must equal auth.uid().