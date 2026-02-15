import { weeklyAccuracyTrend, rollingAccuracyTrend } from '@shared/utils/trends';

describe('weeklyAccuracyTrend', () => {
  it('returns empty array for empty input', () => {
    expect(weeklyAccuracyTrend([])).toEqual([]);
  });

  it('skips tasks without completed_at', () => {
    const result = weeklyAccuracyTrend([
      { estimated_minutes: 10, actual_seconds: 600, completed_at: null },
    ]);
    expect(result).toEqual([]);
  });

  it('groups tasks by ISO week', () => {
    const result = weeklyAccuracyTrend([
      // Monday Jan 6 2025
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-06T10:00:00Z' },
      // Wednesday Jan 8 2025 (same week)
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-08T10:00:00Z' },
      // Monday Jan 13 2025 (next week)
      { estimated_minutes: 10, actual_seconds: 900, completed_at: '2025-01-13T10:00:00Z' },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].taskCount).toBe(2);
    expect(result[1].taskCount).toBe(1);
  });

  it('sorts oldest-first', () => {
    const result = weeklyAccuracyTrend([
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-13T10:00:00Z' },
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-06T10:00:00Z' },
    ]);

    expect(result).toHaveLength(2);
    // First entry should be from the earlier week
    expect(result[0].taskCount).toBe(1);
    expect(result[1].taskCount).toBe(1);
  });
});

describe('rollingAccuracyTrend', () => {
  it('returns empty array for empty input', () => {
    expect(rollingAccuracyTrend([])).toEqual([]);
  });

  it('returns one point per completed task', () => {
    const tasks = [
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-06T10:00:00Z' },
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-07T10:00:00Z' },
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-08T10:00:00Z' },
    ];
    const result = rollingAccuracyTrend(tasks, 2);
    expect(result).toHaveLength(3);
  });

  it('window size limits included tasks', () => {
    const tasks = [
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-06T10:00:00Z' },
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-07T10:00:00Z' },
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-08T10:00:00Z' },
    ];
    const result = rollingAccuracyTrend(tasks, 2);
    // Third point should have window of 2
    expect(result[2].taskCount).toBe(2);
    // First point only has 1 task (window not yet full)
    expect(result[0].taskCount).toBe(1);
  });

  it('skips tasks without completed_at', () => {
    const tasks = [
      { estimated_minutes: 10, actual_seconds: 600, completed_at: '2025-01-06T10:00:00Z' },
      { estimated_minutes: 10, actual_seconds: 600, completed_at: null },
    ];
    const result = rollingAccuracyTrend(tasks);
    expect(result).toHaveLength(1);
  });
});
