const TZ = 'Asia/Tokyo';

/** "4月17日 11:30" */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: TZ,
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/** "2026年4月17日(金) 11:30" — for receipts / order confirmation */
export function formatDateLong(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/** "11:30" — time only */
export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/** "4/17 11:30" — compact for lists */
export function formatDateShort(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: TZ,
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Returns YYYY-MM-DD in JST from any Date object.
 * Use this instead of toISOString().slice(0,10) which gives UTC date.
 */
export function toJSTDateString(date: Date): string {
  return date.toLocaleDateString('sv-SE', { timeZone: TZ });
}

/**
 * Returns HH:mm in JST from any Date object.
 */
export function toJSTTimeString(date: Date): string {
  return date.toLocaleTimeString('sv-SE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
}

export interface DateValidationHours {
  businessDays: readonly number[];
  holidays?: readonly string[];
  specialDays?: readonly string[];
}

/**
 * Returns true if the given date is a valid order date:
 * not a holiday, and is a business day (or a special open day).
 * Returns false when hours is undefined.
 */
export function isDateValid(d: Date, hours?: DateValidationHours): boolean {
  if (!hours) return false;
  const dayOfWeek = d.getDay();
  const dateStr = d.toLocaleDateString('sv-SE'); // YYYY-MM-DD in local time
  if (hours.holidays && hours.holidays.includes(dateStr)) return false;
  if (hours.specialDays && hours.specialDays.includes(dateStr)) return true;
  if (!hours.businessDays.includes(dayOfWeek)) return false;
  return true;
}
