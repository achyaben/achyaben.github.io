const TZ = 'Asia/Tokyo';
const LOCALE = 'ja-JP';
const DATE_KEY_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function parseDateKey(date: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const [, year, month, day] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
}

/**
 * Generic JST date formatter
 * @param date - date string or Date
 * @param options - Intl.DateTimeFormat options
 * @param fallback - fallback string if date is invalid
 */
function formatJST(
  date: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions,
  fallback = '--'
): string {
  if (!date) return fallback;
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, ...options }).format(new Date(date));
}

/** HH:mm (JST) */
export function formatTime(date: string | Date | undefined | null): string {
  return formatJST(date, { hour: '2-digit', minute: '2-digit' }, '--:--');
}

/**
 * "HH:mm" if today, else "M/D HH:mm" (JST, no year)
 */
export function formatOrderedAt(date: string | Date | undefined | null): string {
  if (!date) return '--';
  const d = new Date(date);
  const todayStr = formatJST(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' });
  const dateStr = formatJST(d, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timePart = formatTime(d);
  if (dateStr === todayStr) return timePart;
  const [, m, day] = dateStr.split('/');
  return `${parseInt(m)}/${parseInt(day)} ${timePart}`;
}

/**
 * Always returns YYYY/MM/DD HH:mm (JST)
 */
export function formatDateJST(date: string | Date | undefined | null): string {
  if (!date) return '--';
  const d = new Date(date);
  const [y, m, day] = toJSTDateString(d).split('-');
  const hhmm = formatTime(d);
  return `${y}/${m}/${day} ${hhmm}`;
}

/**
 * Returns YYYY-MM-DD in JST from any Date object.
 * Use this instead of toISOString().slice(0, 10), which gives the UTC date.
 */
export function toJSTDateString(date: string | Date): string {
  return DATE_KEY_FORMATTER.format(new Date(date));
}

/**
 * Adds calendar days to a YYYY-MM-DD date key without involving browser-local timezone.
 */
export function addDaysToDateKey(date: string, days: number): string {
  const parts = parseDateKey(date);
  if (!parts) return date;
  const result = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return [
    result.getUTCFullYear(),
    String(result.getUTCMonth() + 1).padStart(2, '0'),
    String(result.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Builds a half-open UTC ISO range covering one JST calendar day.
 * Example: 2026-09-15 JST => 2026-09-14T15:00:00.000Z to 2026-09-15T15:00:00.000Z.
 */
export function getJSTDateRangeUtc(date: string): { start: string; end: string } | null {
  const parts = parseDateKey(date);
  if (!parts) return null;
  const startMs = Date.UTC(parts.year, parts.month - 1, parts.day, -9);
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + 24 * 60 * 60 * 1000).toISOString(),
  };
}
