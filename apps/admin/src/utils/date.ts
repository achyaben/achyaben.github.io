const TZ = 'Asia/Tokyo';

/** "11:30" */
export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return '--:--';
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/** "11:30" for today, "4/17 11:30" for any other day */
export function formatOrderedAt(date: string | Date | undefined | null): string {
  if (!date) return '--';
  const d = new Date(date);
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: TZ });
  const dateStr = d.toLocaleDateString('sv-SE', { timeZone: TZ });
  const timePart = new Intl.DateTimeFormat('ja-JP', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
  if (dateStr === todayStr) return timePart;
  const [, m, day] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(day)} ${timePart}`;
}
