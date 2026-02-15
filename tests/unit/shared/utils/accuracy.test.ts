import { calculatePerTaskAccuracy } from '@shared/utils/accuracy';

describe('calculatePerTaskAccuracy', () => {
  it('returns 0 for empty array', () => {
    expect(calculatePerTaskAccuracy([])).toBe(0);
  });

  it('returns 0 when no tasks have estimates', () => {
    expect(
      calculatePerTaskAccuracy([
        { estimated_minutes: 0, actual_seconds: 120 },
        { estimated_minutes: null, actual_seconds: 60 },
      ])
    ).toBe(0);
  });

  it('returns 100 for perfect accuracy', () => {
    expect(
      calculatePerTaskAccuracy([{ estimated_minutes: 10, actual_seconds: 600 }])
    ).toBe(100);
  });

  it('penalizes overestimates', () => {
    // estimated 10 min (600s), actual 900s → |900-600|/600 = 0.5 → accuracy 50%
    const result = calculatePerTaskAccuracy([{ estimated_minutes: 10, actual_seconds: 900 }]);
    expect(result).toBe(50);
  });

  it('penalizes underestimates', () => {
    // estimated 10 min (600s), actual 300s → |300-600|/600 = 0.5 → accuracy 50%
    const result = calculatePerTaskAccuracy([{ estimated_minutes: 10, actual_seconds: 300 }]);
    expect(result).toBe(50);
  });

  it('clamps to 0 when way off', () => {
    // estimated 1 min (60s), actual 600s → |600-60|/60 = 9 → clamped to 0
    const result = calculatePerTaskAccuracy([{ estimated_minutes: 1, actual_seconds: 600 }]);
    expect(result).toBe(0);
  });

  it('averages accuracy across multiple tasks', () => {
    const result = calculatePerTaskAccuracy([
      { estimated_minutes: 10, actual_seconds: 600 }, // 100%
      { estimated_minutes: 10, actual_seconds: 900 }, // 50%
    ]);
    expect(result).toBe(75); // (100 + 50) / 2
  });

  it('skips tasks with null estimates', () => {
    const result = calculatePerTaskAccuracy([
      { estimated_minutes: 10, actual_seconds: 600 }, // 100%
      { estimated_minutes: null, actual_seconds: 120 }, // skipped
    ]);
    expect(result).toBe(100);
  });
});
