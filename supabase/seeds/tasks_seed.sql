-- seeds/tasks_seed.sql
-- Realistic sample data for `public.tasks`

-- Create test users in auth.users so foreign key constraints are satisfied
-- GoTrue scans string columns into Go strings (not pointers), so NULLs cause scan errors.
-- We must explicitly set email_change, phone_change, and token columns to empty strings.
-- phone is left as NULL (default) since it has a unique constraint.
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
)
VALUES
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@test.com', crypt('password123', gen_salt('bf')),
   NOW(), NOW(), NOW(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{}', false, false),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@test.com', crypt('password123', gen_salt('bf')),
   NOW(), NOW(), NOW(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{}', false, false),
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'charlie@test.com', crypt('password123', gen_salt('bf')),
   NOW(), NOW(), NOW(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{}', false, false)
ON CONFLICT (id) DO NOTHING;

-- Create identity records (required for signInWithPassword to work)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '{"sub":"11111111-1111-4111-8111-111111111111","email":"alice@test.com"}', 'email', NOW(), NOW(), NOW()),
  ('22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '{"sub":"22222222-2222-4222-8222-222222222222","email":"bob@test.com"}', 'email', NOW(), NOW(), NOW()),
  ('33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', '{"sub":"33333333-3333-4333-8333-333333333333","email":"charlie@test.com"}', 'email', NOW(), NOW(), NOW())
ON CONFLICT (provider_id, provider) DO NOTHING;

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