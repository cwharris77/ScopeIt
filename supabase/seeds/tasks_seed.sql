-- seeds/tasks_seed.sql
-- Comprehensive seed data for all tables
-- Users: alice@test.com, bob@test.com, charlie@test.com (password: password123)

-- ============================================================================
-- User IDs (constants)
-- ============================================================================
-- Alice: 11111111-1111-4111-8111-111111111111
-- Bob:   22222222-2222-4222-8222-222222222222
-- Charlie: 33333333-3333-4333-8333-333333333333

-- ============================================================================
-- auth.users
-- ============================================================================
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

-- ============================================================================
-- auth.identities (required for signInWithPassword)
-- ============================================================================
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '{"sub":"11111111-1111-4111-8111-111111111111","email":"alice@test.com"}', 'email', NOW(), NOW(), NOW()),
  ('22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '{"sub":"22222222-2222-4222-8222-222222222222","email":"bob@test.com"}', 'email', NOW(), NOW(), NOW()),
  ('33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', '{"sub":"33333333-3333-4333-8333-333333333333","email":"charlie@test.com"}', 'email', NOW(), NOW(), NOW())
ON CONFLICT (provider_id, provider) DO NOTHING;

-- ============================================================================
-- projects (~3 per user)
-- ============================================================================
INSERT INTO public.projects (id, name, color, user_id, created_at) VALUES
  -- Alice (PM)
  ('aaaa0001-0000-4000-8000-000000000001', 'Q2 Roadmap',       '#087f8c', '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '30 days'),
  ('aaaa0001-0000-4000-8000-000000000002', 'User Research',     '#6366f1', '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '25 days'),
  ('aaaa0001-0000-4000-8000-000000000003', 'Team Operations',   '#f59e0b', '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '20 days'),
  -- Bob (Engineer)
  ('bbbb0001-0000-4000-8000-000000000001', 'Auth System',        '#EF4444', '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '28 days'),
  ('bbbb0001-0000-4000-8000-000000000002', 'Performance Sprint', '#10b981', '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '14 days'),
  ('bbbb0001-0000-4000-8000-000000000003', 'Tech Debt',          '#8b5cf6', '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '21 days'),
  -- Charlie (Designer)
  ('cccc0001-0000-4000-8000-000000000001', 'Design System',        '#f97316', '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '30 days'),
  ('cccc0001-0000-4000-8000-000000000002', 'Onboarding Redesign',  '#ec4899', '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '18 days'),
  ('cccc0001-0000-4000-8000-000000000003', 'Mobile App',           '#14b8a6', '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '12 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- tags (~4 per user)
-- ============================================================================
INSERT INTO public.tags (id, name, color, user_id, created_at) VALUES
  -- Alice
  ('aaa20001-0000-4000-8000-000000000001', 'urgent',      '#EF4444', '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '30 days'),
  ('aaa20001-0000-4000-8000-000000000002', 'stakeholder', '#f59e0b', '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '30 days'),
  ('aaa20001-0000-4000-8000-000000000003', 'blocked',     '#6b7280', '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '30 days'),
  ('aaa20001-0000-4000-8000-000000000004', 'review',      '#087f8c', '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '30 days'),
  -- Bob
  ('bbb20001-0000-4000-8000-000000000001', 'frontend',    '#3b82f6', '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '28 days'),
  ('bbb20001-0000-4000-8000-000000000002', 'backend',     '#10b981', '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '28 days'),
  ('bbb20001-0000-4000-8000-000000000003', 'bug',         '#EF4444', '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '28 days'),
  ('bbb20001-0000-4000-8000-000000000004', 'refactor',    '#8b5cf6', '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '28 days'),
  -- Charlie
  ('ccc20001-0000-4000-8000-000000000001', 'ui',            '#f97316', '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '30 days'),
  ('ccc20001-0000-4000-8000-000000000002', 'ux',            '#ec4899', '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '30 days'),
  ('ccc20001-0000-4000-8000-000000000003', 'accessibility', '#14b8a6', '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '30 days'),
  ('ccc20001-0000-4000-8000-000000000004', 'animation',     '#6366f1', '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- tasks (~9 per user, 27 total)
-- Statuses: pending, running, paused, completed
-- Categories: work, coding, design, meeting, personal
-- Priorities: 1 (low), 5 (medium), 10 (high)
-- ============================================================================
INSERT INTO public.tasks (id, name, description, priority, category, status, estimated_minutes, actual_seconds, user_id, project_id, started_at, completed_at, created_at) VALUES

  -- ========== Alice (PM) ==========
  -- Q2 Roadmap project
  ('aaaa1001-0000-4000-8000-000000000001', 'Draft Q2 OKRs',              'Define objectives and key results for Q2',              10, 'work',    'completed', 120, 6840,  '11111111-1111-4111-8111-111111111111', 'aaaa0001-0000-4000-8000-000000000001', NOW() - INTERVAL '25 days', NOW() - INTERVAL '24 days', NOW() - INTERVAL '26 days'),
  ('aaaa1001-0000-4000-8000-000000000002', 'Prioritize feature backlog', 'Stack rank features with eng and design leads',         5,  'meeting', 'completed', 60,  4200,  '11111111-1111-4111-8111-111111111111', 'aaaa0001-0000-4000-8000-000000000001', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '21 days'),
  ('aaaa1001-0000-4000-8000-000000000003', 'Write roadmap doc',          'Create shareable roadmap document for stakeholders',    5,  'work',    'running',   90,  2700,  '11111111-1111-4111-8111-111111111111', 'aaaa0001-0000-4000-8000-000000000001', NOW() - INTERVAL '2 days',  NULL,                        NOW() - INTERVAL '3 days'),

  -- User Research project
  ('aaaa1001-0000-4000-8000-000000000004', 'Schedule user interviews',   'Recruit 6 users for onboarding feedback sessions',     5,  'work',    'completed', 30,  2100,  '11111111-1111-4111-8111-111111111111', 'aaaa0001-0000-4000-8000-000000000002', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '16 days'),
  ('aaaa1001-0000-4000-8000-000000000005', 'Conduct user interviews',    'Interview users about onboarding pain points',         10, 'meeting', 'completed', 180, 11400, '11111111-1111-4111-8111-111111111111', 'aaaa0001-0000-4000-8000-000000000002', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '13 days'),
  ('aaaa1001-0000-4000-8000-000000000006', 'Synthesize research findings','Compile insights and share with team',                5,  'work',    'paused',    120, 1800,  '11111111-1111-4111-8111-111111111111', 'aaaa0001-0000-4000-8000-000000000002', NOW() - INTERVAL '8 days',  NULL,                        NOW() - INTERVAL '9 days'),

  -- Team Operations project
  ('aaaa1001-0000-4000-8000-000000000007', 'Run weekly standup',         'Facilitate Monday standup with full team',              1,  'meeting', 'completed', 15,  1080,  '11111111-1111-4111-8111-111111111111', 'aaaa0001-0000-4000-8000-000000000003', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '6 days'),
  ('aaaa1001-0000-4000-8000-000000000008', 'Update team wiki',           'Document new processes and decisions',                  1,  'work',    'pending',   45,  0,     '11111111-1111-4111-8111-111111111111', 'aaaa0001-0000-4000-8000-000000000003', NULL,                       NULL,                        NOW() - INTERVAL '2 days'),
  ('aaaa1001-0000-4000-8000-000000000009', 'Prep sprint retro',          'Gather data and prepare retro board',                  5,  'meeting', 'pending',   30,  0,     '11111111-1111-4111-8111-111111111111', 'aaaa0001-0000-4000-8000-000000000003', NULL,                       NULL,                        NOW() - INTERVAL '1 day'),

  -- ========== Bob (Engineer) ==========
  -- Auth System project
  ('bbbb1001-0000-4000-8000-000000000001', 'Fix auth token refresh',     'Token refresh fails silently when session expires',     10, 'coding',  'completed', 120, 8400,  '22222222-2222-4222-8222-222222222222', 'bbbb0001-0000-4000-8000-000000000001', NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days', NOW() - INTERVAL '23 days'),
  ('bbbb1001-0000-4000-8000-000000000002', 'Add OAuth2 PKCE flow',       'Implement PKCE for mobile auth security',              10, 'coding',  'running',   240, 7200,  '22222222-2222-4222-8222-222222222222', 'bbbb0001-0000-4000-8000-000000000001', NOW() - INTERVAL '3 days',  NULL,                        NOW() - INTERVAL '5 days'),
  ('bbbb1001-0000-4000-8000-000000000003', 'Write auth middleware tests', 'Unit and integration tests for auth middleware',       5,  'coding',  'pending',   90,  0,     '22222222-2222-4222-8222-222222222222', 'bbbb0001-0000-4000-8000-000000000001', NULL,                       NULL,                        NOW() - INTERVAL '2 days'),

  -- Performance Sprint project
  ('bbbb1001-0000-4000-8000-000000000004', 'Profile API endpoints',      'Identify slowest endpoints with flame graphs',         5,  'coding',  'completed', 60,  4500,  '22222222-2222-4222-8222-222222222222', 'bbbb0001-0000-4000-8000-000000000002', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days',  NOW() - INTERVAL '11 days'),
  ('bbbb1001-0000-4000-8000-000000000005', 'Optimize task list query',    'Add index and reduce N+1 on task list endpoint',       10, 'coding',  'completed', 90,  5400,  '22222222-2222-4222-8222-222222222222', 'bbbb0001-0000-4000-8000-000000000002', NOW() - INTERVAL '8 days',  NOW() - INTERVAL '7 days',  NOW() - INTERVAL '9 days'),
  ('bbbb1001-0000-4000-8000-000000000006', 'Add Redis caching layer',    'Cache frequently accessed data in Redis',              5,  'coding',  'paused',    180, 3600,  '22222222-2222-4222-8222-222222222222', 'bbbb0001-0000-4000-8000-000000000002', NOW() - INTERVAL '5 days',  NULL,                        NOW() - INTERVAL '6 days'),

  -- Tech Debt project
  ('bbbb1001-0000-4000-8000-000000000007', 'Upgrade to Node 22',         'Update runtime and fix breaking changes',              1,  'coding',  'completed', 60,  3000,  '22222222-2222-4222-8222-222222222222', 'bbbb0001-0000-4000-8000-000000000003', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '17 days'),
  ('bbbb1001-0000-4000-8000-000000000008', 'Remove deprecated API calls','Clean up v1 API usage across codebase',                1,  'coding',  'pending',   120, 0,     '22222222-2222-4222-8222-222222222222', 'bbbb0001-0000-4000-8000-000000000003', NULL,                       NULL,                        NOW() - INTERVAL '3 days'),
  ('bbbb1001-0000-4000-8000-000000000009', 'Daily standup',              'Quick sync with the team',                             1,  'meeting', 'completed', 15,  900,   '22222222-2222-4222-8222-222222222222', NULL,                                   NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day',   NOW() - INTERVAL '1 day'),

  -- ========== Charlie (Designer) ==========
  -- Design System project
  ('cccc1001-0000-4000-8000-000000000001', 'Audit existing components',   'Catalog all UI components and inconsistencies',       5,  'design',  'completed', 120, 7800,  '33333333-3333-4333-8333-333333333333', 'cccc0001-0000-4000-8000-000000000001', NOW() - INTERVAL '26 days', NOW() - INTERVAL '25 days', NOW() - INTERVAL '27 days'),
  ('cccc1001-0000-4000-8000-000000000002', 'Create color token system',   'Define semantic color tokens for light/dark themes',  10, 'design',  'completed', 90,  6600,  '33333333-3333-4333-8333-333333333333', 'cccc0001-0000-4000-8000-000000000001', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '21 days'),
  ('cccc1001-0000-4000-8000-000000000003', 'Build button component spec', 'Define all button variants, sizes, and states',       5,  'design',  'running',   60,  2400,  '33333333-3333-4333-8333-333333333333', 'cccc0001-0000-4000-8000-000000000001', NOW() - INTERVAL '2 days',  NULL,                        NOW() - INTERVAL '3 days'),

  -- Onboarding Redesign project
  ('cccc1001-0000-4000-8000-000000000004', 'Map current onboarding flow', 'Document all screens and decision points',            5,  'design',  'completed', 45,  3000,  '33333333-3333-4333-8333-333333333333', 'cccc0001-0000-4000-8000-000000000002', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '16 days'),
  ('cccc1001-0000-4000-8000-000000000005', 'Design welcome screens',      'High-fidelity mocks for new onboarding welcome',     10, 'design',  'completed', 90,  5400,  '33333333-3333-4333-8333-333333333333', 'cccc0001-0000-4000-8000-000000000002', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', NOW() - INTERVAL '13 days'),
  ('cccc1001-0000-4000-8000-000000000006', 'User test new onboarding',    'Run 5 usability tests on new onboarding prototype',  10, 'meeting', 'paused',    120, 3600,  '33333333-3333-4333-8333-333333333333', 'cccc0001-0000-4000-8000-000000000002', NOW() - INTERVAL '4 days',  NULL,                        NOW() - INTERVAL '5 days'),

  -- Mobile App project
  ('cccc1001-0000-4000-8000-000000000007', 'Design bottom nav icons',     'Create custom icons for tab bar navigation',          5,  'design',  'completed', 60,  4200,  '33333333-3333-4333-8333-333333333333', 'cccc0001-0000-4000-8000-000000000003', NOW() - INTERVAL '9 days',  NOW() - INTERVAL '8 days',  NOW() - INTERVAL '10 days'),
  ('cccc1001-0000-4000-8000-000000000008', 'Prototype swipe gestures',    'Interactive prototype for task swipe actions',         5,  'design',  'pending',   90,  0,     '33333333-3333-4333-8333-333333333333', 'cccc0001-0000-4000-8000-000000000003', NULL,                       NULL,                        NOW() - INTERVAL '2 days'),
  ('cccc1001-0000-4000-8000-000000000009', 'Review PR with dev team',     'Walk through implementation of new components',       1,  'meeting', 'pending',   30,  0,     '33333333-3333-4333-8333-333333333333', NULL,                                   NULL,                       NULL,                        NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- task_tags (~2 tags per task on average)
-- ============================================================================
INSERT INTO public.task_tags (task_id, tag_id) VALUES
  -- Alice's tasks
  ('aaaa1001-0000-4000-8000-000000000001', 'aaa20001-0000-4000-8000-000000000001'), -- Draft Q2 OKRs + urgent
  ('aaaa1001-0000-4000-8000-000000000001', 'aaa20001-0000-4000-8000-000000000002'), -- Draft Q2 OKRs + stakeholder
  ('aaaa1001-0000-4000-8000-000000000002', 'aaa20001-0000-4000-8000-000000000002'), -- Prioritize backlog + stakeholder
  ('aaaa1001-0000-4000-8000-000000000003', 'aaa20001-0000-4000-8000-000000000004'), -- Write roadmap doc + review
  ('aaaa1001-0000-4000-8000-000000000004', 'aaa20001-0000-4000-8000-000000000001'), -- Schedule interviews + urgent
  ('aaaa1001-0000-4000-8000-000000000005', 'aaa20001-0000-4000-8000-000000000002'), -- Conduct interviews + stakeholder
  ('aaaa1001-0000-4000-8000-000000000006', 'aaa20001-0000-4000-8000-000000000003'), -- Synthesize findings + blocked
  ('aaaa1001-0000-4000-8000-000000000006', 'aaa20001-0000-4000-8000-000000000004'), -- Synthesize findings + review
  ('aaaa1001-0000-4000-8000-000000000009', 'aaa20001-0000-4000-8000-000000000004'), -- Prep retro + review

  -- Bob's tasks
  ('bbbb1001-0000-4000-8000-000000000001', 'bbb20001-0000-4000-8000-000000000002'), -- Fix auth token + backend
  ('bbbb1001-0000-4000-8000-000000000001', 'bbb20001-0000-4000-8000-000000000003'), -- Fix auth token + bug
  ('bbbb1001-0000-4000-8000-000000000002', 'bbb20001-0000-4000-8000-000000000002'), -- OAuth2 PKCE + backend
  ('bbbb1001-0000-4000-8000-000000000002', 'bbb20001-0000-4000-8000-000000000001'), -- OAuth2 PKCE + frontend
  ('bbbb1001-0000-4000-8000-000000000003', 'bbb20001-0000-4000-8000-000000000002'), -- Auth tests + backend
  ('bbbb1001-0000-4000-8000-000000000004', 'bbb20001-0000-4000-8000-000000000002'), -- Profile endpoints + backend
  ('bbbb1001-0000-4000-8000-000000000005', 'bbb20001-0000-4000-8000-000000000002'), -- Optimize query + backend
  ('bbbb1001-0000-4000-8000-000000000005', 'bbb20001-0000-4000-8000-000000000004'), -- Optimize query + refactor
  ('bbbb1001-0000-4000-8000-000000000006', 'bbb20001-0000-4000-8000-000000000002'), -- Redis caching + backend
  ('bbbb1001-0000-4000-8000-000000000007', 'bbb20001-0000-4000-8000-000000000004'), -- Upgrade Node + refactor
  ('bbbb1001-0000-4000-8000-000000000008', 'bbb20001-0000-4000-8000-000000000004'), -- Remove deprecated + refactor
  ('bbbb1001-0000-4000-8000-000000000008', 'bbb20001-0000-4000-8000-000000000001'), -- Remove deprecated + frontend

  -- Charlie's tasks
  ('cccc1001-0000-4000-8000-000000000001', 'ccc20001-0000-4000-8000-000000000001'), -- Audit components + ui
  ('cccc1001-0000-4000-8000-000000000001', 'ccc20001-0000-4000-8000-000000000002'), -- Audit components + ux
  ('cccc1001-0000-4000-8000-000000000002', 'ccc20001-0000-4000-8000-000000000001'), -- Color tokens + ui
  ('cccc1001-0000-4000-8000-000000000002', 'ccc20001-0000-4000-8000-000000000003'), -- Color tokens + accessibility
  ('cccc1001-0000-4000-8000-000000000003', 'ccc20001-0000-4000-8000-000000000001'), -- Button spec + ui
  ('cccc1001-0000-4000-8000-000000000004', 'ccc20001-0000-4000-8000-000000000002'), -- Map onboarding + ux
  ('cccc1001-0000-4000-8000-000000000005', 'ccc20001-0000-4000-8000-000000000001'), -- Welcome screens + ui
  ('cccc1001-0000-4000-8000-000000000005', 'ccc20001-0000-4000-8000-000000000004'), -- Welcome screens + animation
  ('cccc1001-0000-4000-8000-000000000006', 'ccc20001-0000-4000-8000-000000000002'), -- User test + ux
  ('cccc1001-0000-4000-8000-000000000007', 'ccc20001-0000-4000-8000-000000000001'), -- Nav icons + ui
  ('cccc1001-0000-4000-8000-000000000008', 'ccc20001-0000-4000-8000-000000000004'), -- Swipe gestures + animation
  ('cccc1001-0000-4000-8000-000000000008', 'ccc20001-0000-4000-8000-000000000002')  -- Swipe gestures + ux
ON CONFLICT (task_id, tag_id) DO NOTHING;

-- ============================================================================
-- templates (~2 per user, 6 total)
-- ============================================================================
INSERT INTO public.templates (id, name, description, estimated_minutes, category, priority, use_count, user_id, created_at) VALUES
  -- Alice
  ('aaaa2001-0000-4000-8000-000000000001', 'Daily Standup',          'Quick sync with team on progress and blockers',      15,  'meeting', 1,  12, '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '30 days'),
  ('aaaa2001-0000-4000-8000-000000000002', 'Sprint Planning',        'Plan upcoming sprint with the full team',            60,  'meeting', 5,  4,  '11111111-1111-4111-8111-111111111111', NOW() - INTERVAL '30 days'),
  -- Bob
  ('bbbb2001-0000-4000-8000-000000000001', 'Code Review',            'Review pull request and leave feedback',             30,  'coding',  5,  8,  '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '28 days'),
  ('bbbb2001-0000-4000-8000-000000000002', 'Bug Triage',             'Investigate and prioritize incoming bug reports',    45,  'coding',  10, 6,  '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '28 days'),
  -- Charlie
  ('cccc2001-0000-4000-8000-000000000001', 'Design Critique',        'Review designs with team and gather feedback',       30,  'design',  5,  5,  '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '30 days'),
  ('cccc2001-0000-4000-8000-000000000002', 'User Testing Session',   'Run moderated usability test with a participant',    60,  'design',  10, 3,  '33333333-3333-4333-8333-333333333333', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- daily_logs (last 14 days per user, ~42 total)
-- ============================================================================
INSERT INTO public.daily_logs (id, user_id, date, tasks_completed, total_estimated_seconds, total_actual_seconds, accuracy, created_at) VALUES
  -- Alice — last 14 days
  ('aaa10001-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '13 days')::date, 2, 10800, 9000,   120.0, NOW() - INTERVAL '13 days'),
  ('aaa10001-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '12 days')::date, 1, 3600,  4200,   85.7,  NOW() - INTERVAL '12 days'),
  ('aaa10001-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '11 days')::date, 0, 0,     0,      NULL,  NOW() - INTERVAL '11 days'),
  ('aaa10001-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '10 days')::date, 3, 14400, 12600,  114.3, NOW() - INTERVAL '10 days'),
  ('aaa10001-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '9 days')::date,  1, 5400,  5400,   100.0, NOW() - INTERVAL '9 days'),
  ('aaa10001-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '8 days')::date,  0, 0,     0,      NULL,  NOW() - INTERVAL '8 days'),
  ('aaa10001-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '7 days')::date,  0, 0,     0,      NULL,  NOW() - INTERVAL '7 days'),
  ('aaa10001-0000-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '6 days')::date,  2, 7200,  6000,   120.0, NOW() - INTERVAL '6 days'),
  ('aaa10001-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '5 days')::date,  1, 900,   1080,   83.3,  NOW() - INTERVAL '5 days'),
  ('aaa10001-0000-4000-8000-000000000010', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '4 days')::date,  2, 9000,  8400,   107.1, NOW() - INTERVAL '4 days'),
  ('aaa10001-0000-4000-8000-000000000011', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '3 days')::date,  1, 1800,  2100,   85.7,  NOW() - INTERVAL '3 days'),
  ('aaa10001-0000-4000-8000-000000000012', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '2 days')::date,  0, 0,     0,      NULL,  NOW() - INTERVAL '2 days'),
  ('aaa10001-0000-4000-8000-000000000013', '11111111-1111-4111-8111-111111111111', (CURRENT_DATE - INTERVAL '1 day')::date,   0, 0,     0,      NULL,  NOW() - INTERVAL '1 day'),
  ('aaa10001-0000-4000-8000-000000000014', '11111111-1111-4111-8111-111111111111', CURRENT_DATE,                               1, 5400,  2700,   200.0, NOW()),

  -- Bob — last 14 days
  ('bbb10001-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '13 days')::date, 1, 7200,  8400,   85.7,  NOW() - INTERVAL '13 days'),
  ('bbb10001-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '12 days')::date, 2, 10800, 9000,   120.0, NOW() - INTERVAL '12 days'),
  ('bbb10001-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '11 days')::date, 1, 3600,  4500,   80.0,  NOW() - INTERVAL '11 days'),
  ('bbb10001-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '10 days')::date, 0, 0,     0,      NULL,  NOW() - INTERVAL '10 days'),
  ('bbb10001-0000-4000-8000-000000000005', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '9 days')::date,  2, 9000,  9900,   90.9,  NOW() - INTERVAL '9 days'),
  ('bbb10001-0000-4000-8000-000000000006', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '8 days')::date,  1, 5400,  5400,   100.0, NOW() - INTERVAL '8 days'),
  ('bbb10001-0000-4000-8000-000000000007', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '7 days')::date,  0, 0,     0,      NULL,  NOW() - INTERVAL '7 days'),
  ('bbb10001-0000-4000-8000-000000000008', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '6 days')::date,  0, 0,     0,      NULL,  NOW() - INTERVAL '6 days'),
  ('bbb10001-0000-4000-8000-000000000009', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '5 days')::date,  3, 12600, 10800,  116.7, NOW() - INTERVAL '5 days'),
  ('bbb10001-0000-4000-8000-000000000010', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '4 days')::date,  1, 3600,  3000,   120.0, NOW() - INTERVAL '4 days'),
  ('bbb10001-0000-4000-8000-000000000011', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '3 days')::date,  2, 7200,  6600,   109.1, NOW() - INTERVAL '3 days'),
  ('bbb10001-0000-4000-8000-000000000012', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '2 days')::date,  1, 5400,  5400,   100.0, NOW() - INTERVAL '2 days'),
  ('bbb10001-0000-4000-8000-000000000013', '22222222-2222-4222-8222-222222222222', (CURRENT_DATE - INTERVAL '1 day')::date,   1, 900,   900,    100.0, NOW() - INTERVAL '1 day'),
  ('bbb10001-0000-4000-8000-000000000014', '22222222-2222-4222-8222-222222222222', CURRENT_DATE,                               0, 0,     0,      NULL,  NOW()),

  -- Charlie — last 14 days
  ('ccc10001-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '13 days')::date, 1, 5400,  7800,   69.2,  NOW() - INTERVAL '13 days'),
  ('ccc10001-0000-4000-8000-000000000002', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '12 days')::date, 0, 0,     0,      NULL,  NOW() - INTERVAL '12 days'),
  ('ccc10001-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '11 days')::date, 2, 10800, 12000,  90.0,  NOW() - INTERVAL '11 days'),
  ('ccc10001-0000-4000-8000-000000000004', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '10 days')::date, 1, 3600,  3000,   120.0, NOW() - INTERVAL '10 days'),
  ('ccc10001-0000-4000-8000-000000000005', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '9 days')::date,  1, 5400,  4200,   128.6, NOW() - INTERVAL '9 days'),
  ('ccc10001-0000-4000-8000-000000000006', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '8 days')::date,  0, 0,     0,      NULL,  NOW() - INTERVAL '8 days'),
  ('ccc10001-0000-4000-8000-000000000007', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '7 days')::date,  0, 0,     0,      NULL,  NOW() - INTERVAL '7 days'),
  ('ccc10001-0000-4000-8000-000000000008', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '6 days')::date,  2, 7200,  7200,   100.0, NOW() - INTERVAL '6 days'),
  ('ccc10001-0000-4000-8000-000000000009', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '5 days')::date,  1, 2700,  3000,   90.0,  NOW() - INTERVAL '5 days'),
  ('ccc10001-0000-4000-8000-000000000010', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '4 days')::date,  2, 9000,  9600,   93.8,  NOW() - INTERVAL '4 days'),
  ('ccc10001-0000-4000-8000-000000000011', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '3 days')::date,  1, 3600,  4200,   85.7,  NOW() - INTERVAL '3 days'),
  ('ccc10001-0000-4000-8000-000000000012', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '2 days')::date,  0, 0,     0,      NULL,  NOW() - INTERVAL '2 days'),
  ('ccc10001-0000-4000-8000-000000000013', '33333333-3333-4333-8333-333333333333', (CURRENT_DATE - INTERVAL '1 day')::date,   1, 3600,  4200,   85.7,  NOW() - INTERVAL '1 day'),
  ('ccc10001-0000-4000-8000-000000000014', '33333333-3333-4333-8333-333333333333', CURRENT_DATE,                               0, 0,     0,      NULL,  NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- task_analyses (1 per user, realistic Gemini-style output)
-- ============================================================================
INSERT INTO public.task_analyses (id, user_id, completed_count, analysis, created_at) VALUES
  ('aaaa3001-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 5, '{
    "summary": "You completed 5 tasks over the past two weeks, primarily focused on roadmap planning and user research. Your estimation accuracy averages around 105%, meaning you slightly overestimate task duration — a good sign of planning maturity.",
    "insights": [
      "Meeting-type tasks consistently take less time than estimated, suggesting you could tighten those estimates.",
      "Research tasks tend to run over — the user interviews took 90 minutes longer than planned.",
      "You have a productive pattern of front-loading high-priority work early in the week."
    ],
    "recommendations": [
      "Consider breaking research tasks into smaller chunks to improve accuracy.",
      "Your blocked task on synthesizing findings has been paused for 8 days — consider unblocking it or removing the dependency.",
      "Add buffer time to interview sessions to account for participant scheduling delays."
    ]
  }', NOW() - INTERVAL '2 days'),

  ('bbbb3001-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 6, '{
    "summary": "You completed 6 tasks in the last two weeks, heavily focused on backend engineering. Your estimation accuracy is around 95%, with a tendency to slightly underestimate complex coding tasks but overestimate quick fixes.",
    "insights": [
      "Bug fixes took 40% longer than estimated on average — consider adding a debugging buffer.",
      "Your performance optimization work was well-scoped and delivered close to estimates.",
      "The Node 22 upgrade went faster than planned — you may be getting more conservative with infrastructure estimates."
    ],
    "recommendations": [
      "The Redis caching task has been paused — consider whether it is still a priority given the query optimization wins.",
      "Your auth middleware tests are pending and blocking the OAuth2 PKCE completion — tackle tests first.",
      "Try timeboxing bug investigations to 30 minutes before escalating for a second pair of eyes."
    ]
  }', NOW() - INTERVAL '1 day'),

  ('cccc3001-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 5, '{
    "summary": "You completed 5 tasks over the past two weeks across design system and onboarding work. Your estimation accuracy is around 88% — design tasks consistently take longer than expected, likely due to iteration cycles.",
    "insights": [
      "Component audit and color token work both ran significantly over estimate, suggesting design exploration takes more time than pure execution.",
      "Your completed tasks cluster around the start of the two-week period — recent days show more in-progress and paused work.",
      "Meetings (design critiques, user testing) are well-estimated."
    ],
    "recommendations": [
      "Add 30% buffer to design exploration tasks to account for iteration time.",
      "The user testing task for onboarding is paused — prioritize completing it while the prototype context is still fresh.",
      "Consider batching icon and component work together to stay in a visual design flow state."
    ]
  }', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
