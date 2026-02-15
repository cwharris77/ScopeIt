import {
  formatTime,
  msToDisplay,
  secondsToDisplay,
  minutesToDisplay,
  getPercentageStatus,
} from '@shared/utils/time';

describe('formatTime', () => {
  it('formats 0ms as "0s"', () => {
    expect(formatTime(0)).toBe('0s');
  });

  it('formats seconds only', () => {
    expect(formatTime(45000)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125000)).toBe('2m 5s');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatTime(3661000)).toBe('1h 1m 1s');
  });

  it('omits zero minutes when only hours and seconds', () => {
    expect(formatTime(3601000)).toBe('1h 1s');
  });
});

describe('msToDisplay', () => {
  it('formats 0 as 00:00:00', () => {
    expect(msToDisplay(0)).toBe('00:00:00');
  });

  it('formats seconds and minutes', () => {
    expect(msToDisplay(61000)).toBe('00:01:01');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(msToDisplay(3661000)).toBe('01:01:01');
  });

  it('pads single digits', () => {
    expect(msToDisplay(5000)).toBe('00:00:05');
  });
});

describe('secondsToDisplay', () => {
  it('shows seconds only when under 60', () => {
    expect(secondsToDisplay(45)).toBe('45s');
  });

  it('shows minutes and seconds when >= 60', () => {
    expect(secondsToDisplay(125)).toBe('2m 5s');
  });

  it('shows hours when >= 3600', () => {
    expect(secondsToDisplay(3661)).toBe('1h 1m 1s');
  });

  it('handles zero', () => {
    expect(secondsToDisplay(0)).toBe('0s');
  });
});

describe('minutesToDisplay', () => {
  it('shows minutes only when under 60', () => {
    expect(minutesToDisplay(45)).toBe('45m');
  });

  it('shows hours and minutes when >= 60', () => {
    expect(minutesToDisplay(90)).toBe('1h 30m');
  });

  it('handles exact hours', () => {
    expect(minutesToDisplay(120)).toBe('2h 0m');
  });

  it('handles zero', () => {
    expect(minutesToDisplay(0)).toBe('0m');
  });
});

describe('getPercentageStatus', () => {
  it('returns success when actual <= expected', () => {
    expect(getPercentageStatus(5000, 10000)).toBe('success');
  });

  it('returns success when actual equals expected', () => {
    expect(getPercentageStatus(10000, 10000)).toBe('success');
  });

  it('returns warning when actual is up to 125% of expected', () => {
    expect(getPercentageStatus(12500, 10000)).toBe('warning');
  });

  it('returns danger when actual exceeds 125% of expected', () => {
    expect(getPercentageStatus(12600, 10000)).toBe('danger');
  });

  it('returns success when expected is 0', () => {
    expect(getPercentageStatus(5000, 0)).toBe('success');
  });
});
