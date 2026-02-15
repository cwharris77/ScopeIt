import {
  TASK_STATUS,
  CATEGORIES,
  TaskPriority,
  SORT_OPTIONS,
} from '@shared/constants/tasks';

describe('TASK_STATUS', () => {
  it('has 4 status values', () => {
    expect(Object.keys(TASK_STATUS)).toHaveLength(4);
  });

  it('contains expected statuses', () => {
    expect(TASK_STATUS.PENDING).toBe('pending');
    expect(TASK_STATUS.RUNNING).toBe('running');
    expect(TASK_STATUS.PAUSED).toBe('paused');
    expect(TASK_STATUS.COMPLETED).toBe('completed');
  });
});

describe('CATEGORIES', () => {
  it('has 5 categories', () => {
    expect(CATEGORIES).toHaveLength(5);
  });

  it('contains expected values', () => {
    expect(CATEGORIES).toContain('work');
    expect(CATEGORIES).toContain('coding');
    expect(CATEGORIES).toContain('design');
    expect(CATEGORIES).toContain('meeting');
    expect(CATEGORIES).toContain('personal');
  });
});

describe('TaskPriority', () => {
  it('maps low to 1', () => {
    expect(TaskPriority.low).toBe(1);
  });

  it('maps medium to 5', () => {
    expect(TaskPriority.medium).toBe(5);
  });

  it('maps high to 10', () => {
    expect(TaskPriority.high).toBe(10);
  });
});

describe('SORT_OPTIONS', () => {
  it('has 3 entries', () => {
    expect(SORT_OPTIONS).toHaveLength(3);
  });

  it('has correct values', () => {
    const values = SORT_OPTIONS.map((o) => o.value);
    expect(values).toEqual(['newest', 'oldest', 'duration']);
  });
});
