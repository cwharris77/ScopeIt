import { cn } from '@/lib/cn';

describe('cn', () => {
  it('joins multiple class strings', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('filters out false values', () => {
    expect(cn('a', false, 'b')).toBe('a b');
  });

  it('filters out undefined values', () => {
    expect(cn('a', undefined)).toBe('a');
  });

  it('returns empty string for no input', () => {
    expect(cn()).toBe('');
  });

  it('works with conditional pattern', () => {
    const isActive = true;
    expect(cn('btn', isActive && 'active')).toBe('btn active');

    const isDisabled = false;
    expect(cn('btn', isDisabled && 'disabled')).toBe('btn');
  });
});
