/**
 * Per-task scoping accuracy. Keep in sync with utils/accuracy.ts in the app.
 */

export interface TaskForAccuracy {
  estimated_minutes?: number | null;
  actual_seconds?: number | null;
}

export function calculatePerTaskAccuracy(tasks: TaskForAccuracy[]): number {
  const accuracies: number[] = [];
  for (const t of tasks) {
    const expectedSec = (t.estimated_minutes ?? 0) * 60;
    const actualSec = t.actual_seconds ?? 0;
    if (expectedSec > 0) {
      accuracies.push(
        Math.max(0, (1 - Math.abs(actualSec - expectedSec) / expectedSec) * 100)
      );
    }
  }
  return accuracies.length > 0
    ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
    : 0;
}
