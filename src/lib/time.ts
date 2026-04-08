/**
 * Time formatting helpers shared across the UI.
 */

/**
 * Format an hour (0–23) as a human-readable 12-hour clock string.
 * e.g. 0 → "12:00 AM (Midnight)", 13 → "1:00 PM"
 */
export function formatResetHour(hour: number): string {
  if (hour === 0) return '12:00 AM (Midnight)'
  if (hour === 12) return '12:00 PM (Noon)'
  const period = hour < 12 ? 'AM' : 'PM'
  const h = hour <= 12 ? hour : hour - 12
  return `${h}:00 ${period}`
}

/**
 * All 24 hours as Select options.
 */
export const ALL_RESET_HOUR_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: 24 },
  (_, i) => ({ value: String(i), label: formatResetHour(i) })
)
