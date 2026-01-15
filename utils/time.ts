/**
 * Time formatting utilities ported from web app
 */

/**
 * Format milliseconds to human-readable string (Xh Xm Xs)
 */
export const formatTime = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const h = hours > 0 ? `${hours}h ` : '';
  const m = minutes > 0 ? `${minutes}m ` : '';
  const s = `${seconds}s`;

  return `${h}${m}${s}`.trim();
};

/**
 * Format milliseconds to display format (HH:MM:SS)
 */
export const msToDisplay = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
};

/**
 * Format seconds to display format - only shows hours/minutes when needed
 */
export const secondsToDisplay = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Format minutes to display (for estimates)
 */
export const minutesToDisplay = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Get color based on actual vs expected ratio
 * Returns color name for styling
 */
export const getPercentageStatus = (
  actualMs: number,
  expectedMs: number
): 'success' | 'warning' | 'danger' => {
  if (expectedMs === 0) return 'success';
  const ratio = actualMs / expectedMs;
  if (ratio <= 1) return 'success';
  if (ratio <= 1.25) return 'warning';
  return 'danger';
};
