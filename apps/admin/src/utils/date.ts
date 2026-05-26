const TZ = 'Asia/Tokyo';
const LOCALE = 'ja-JP';

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
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hhmm = formatTime(d);
  return `${y}/${m}/${day} ${hhmm}`;
}
