import type { Task, Tag, Project } from '@shared/types';

let counter = 0;
const uid = () => `test-${++counter}`;

export function mockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: uid(),
    user_id: 'user-1',
    name: 'Test Task',
    description: null,
    category: 'work',
    priority: 5,
    status: 'pending',
    estimated_minutes: 30,
    actual_seconds: null,
    started_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    project_id: null,
    ...overrides,
  };
}

export function mockTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: uid(),
    user_id: 'user-1',
    name: 'Test Tag',
    color: '#087f8c',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function mockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: uid(),
    user_id: 'user-1',
    name: 'Test Project',
    archived: null,
    color: '#087f8c',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function resetFixtureCounter() {
  counter = 0;
}
