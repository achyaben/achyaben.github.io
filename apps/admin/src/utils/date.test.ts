import { describe, expect, it } from 'vitest';
import { addDaysToDateKey, formatDateJST, getJSTDateRangeUtc, toJSTDateString } from './date';

describe('admin JST date utilities', () => {
  it('returns the JST date key instead of the UTC date key', () => {
    expect(toJSTDateString('2026-09-14T15:00:00.000Z')).toBe('2026-09-15');
    expect(toJSTDateString('2026-09-15T14:59:59.999Z')).toBe('2026-09-15');
    expect(toJSTDateString('2026-09-15T15:00:00.000Z')).toBe('2026-09-16');
  });

  it('builds a UTC half-open range for one JST calendar day', () => {
    expect(getJSTDateRangeUtc('2026-09-15')).toEqual({
      start: '2026-09-14T15:00:00.000Z',
      end: '2026-09-15T15:00:00.000Z',
    });
  });

  it('rejects invalid date keys instead of building a misleading query range', () => {
    expect(getJSTDateRangeUtc('')).toBeNull();
    expect(getJSTDateRangeUtc('2026/09/15')).toBeNull();
  });

  it('adds calendar days without browser-local timezone drift', () => {
    expect(addDaysToDateKey('2026-09-15', 1)).toBe('2026-09-16');
    expect(addDaysToDateKey('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('formats both date and time in JST', () => {
    expect(formatDateJST('2026-09-14T15:05:00.000Z')).toBe('2026/09/15 00:05');
  });
});
