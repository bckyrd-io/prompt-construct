/** Postgres `numeric` arrives as a string over JSON; normalise before display. */
export function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** `MK 1,200,000` — matches the web app's `MK {price.toLocaleString()}`. */
export function formatMK(amount: number | string | null | undefined): string {
  return `MK ${toNumber(amount).toLocaleString('en-US')}`;
}

/** Drops a trailing `.0` so `3.0` renders as `3` and `3.5` stays `3.5`. */
export function formatDecimal(value: number | string | null | undefined): string {
  const n = toNumber(value);
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(1)));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  );
}

/** Turns a property status into the label the web app shows on cards. */
export function statusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'In Progress';
    case 'payment_in_progress':
      return 'Payment In Progress';
    case 'acquired':
      return 'Acquired';
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    default:
      return 'Available';
  }
}