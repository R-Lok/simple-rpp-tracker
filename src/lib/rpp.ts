/**
 * Pure RPP (Russian Fighter Pull-up Program) logic.
 * No side effects, no storage imports, no React imports.
 * All functions are deterministic given the same inputs.
 */

// ─── Program structure ────────────────────────────────────────────────────────

/**
 * Rest days in the 30-day cycle. Every 6th day (days 6, 12, 18, 24, 30).
 */
export const REST_DAYS = new Set([6, 12, 18, 24, 30])

export function isRestDay(cycleDay: number): boolean {
  return REST_DAYS.has(cycleDay)
}

/**
 * Given a cycle day, return the next working (non-rest) day.
 * The cycle loops back to day 1 after day 30.
 */
export function getNextWorkingDay(cycleDay: number): number {
  let next = (cycleDay % 30) + 1
  while (isRestDay(next)) {
    next = (next % 30) + 1
  }
  return next
}

// ─── Set calculation ──────────────────────────────────────────────────────────

/**
 * Returns the base set pattern for a given max rep (RM).
 *
 * Rules from the program:
 * - 5 RM  → [5, 4, 3, 2, 1]      (step = 1 rep between sets)
 * - 3 RM  → [3, 2, 1, 1]         (special case for beginners)
 * - 15 RM → [12, 10, 8, 6, 4]    (step = 2)
 * - 25 RM → [20, 16, 12, 8, 4]   (step = 4)
 *
 * General formula for RM >= 5:
 *   - 5 sets
 *   - First set = RM - 1 (round down to avoid full max on set 1)
 *   - Step between sets scales with RM
 */
export function getBasePattern(maxRep: number): number[] {
  if (maxRep <= 0) return [1]

  if (maxRep <= 2) {
    return [maxRep, Math.max(1, maxRep - 1)]
  }

  if (maxRep === 3) {
    return [3, 2, 1, 1]
  }

  // For RM 4+: 5 sets.
  //
  // Formula derived from the program's documented examples:
  //   5RM  → [5, 4, 3, 2, 1]   firstSet=5  (=RM),     step=1
  //   15RM → [12, 10, 8, 6, 4] firstSet=12 (≈RM×0.8), step=2
  //   25RM → [20, 16, 12, 8, 4] firstSet=20 (≈RM×0.8), step=4
  //
  // Rule:
  //   firstSet = RM if RM ≤ 5, else round(RM × 0.8)
  //   step     = max(1, round(firstSet / 5))
  const firstSet = maxRep <= 5 ? maxRep : Math.round(maxRep * 0.8)
  const step = Math.max(1, Math.round(firstSet / 5))
  const sets: number[] = []
  for (let i = 0; i < 5; i++) {
    sets.push(Math.max(1, firstSet - step * i))
  }
  return sets
}

/**
 * Returns the set counts for a given working day within a 5-day block.
 *
 * Within each 5-day block (e.g. days 1–5, 7–11, …), the pattern evolves:
 * - Day 1 of block: base pattern        e.g. [5, 4, 3, 2, 1]
 * - Day 2 of block: last set +1         e.g. [5, 4, 3, 2, 2]
 * - Day 3 of block: 2nd-to-last set +1  e.g. [5, 4, 3, 3, 2]
 * - Day 4 of block: 3rd-from-last +1    e.g. [5, 4, 4, 3, 2]
 * - Day 5 of block: 4th-from-last +1    e.g. [5, 5, 4, 3, 2]
 *
 * Then the next block starts with the leading set +1, reset:
 * - Day 1 of next block: [6, 5, 4, 3, 2]
 *
 * @param maxRep - User's starting rep max
 * @param cycleDay - Day in the 30-day cycle (1–30, rest days are 6,12,18,24,30)
 * @returns Array of rep counts per set. Empty array if rest day.
 */
export function getSetsForDay(maxRep: number, cycleDay: number): number[] {
  if (isRestDay(cycleDay)) return []

  const base = getBasePattern(maxRep)
  const numSets = base.length

  // Map cycleDay to a working-day index (0-based) within the full 30-day cycle.
  // Working days within the 30-day cycle: 1,2,3,4,5,7,8,9,10,11,13,...
  const workingDayIndex = cycleDayToWorkingIndex(cycleDay)

  // Which 5-day block are we in (0-based)?
  const blockIndex = Math.floor(workingDayIndex / 5)
  // Which day within that block (0-based, 0–4)?
  const dayInBlock = workingDayIndex % 5

  // The leading set grows by 1 per block
  const leadingSetBonus = blockIndex

  // Build the sets for the current day
  // Start with base pattern shifted by the block bonus
  const blockBase = base.map((reps, i) => {
    if (i === 0) return reps + leadingSetBonus
    // Subsequent sets also shift up proportionally (the program's ladder climbs)
    return reps + leadingSetBonus
  })

  // Apply the daily progression within the block:
  // Each day, bump one more set from the back by 1
  // Day 0: no extra bumps (base)
  // Day 1: last set +1
  // Day 2: 2nd-to-last set +1
  // etc.
  const result = [...blockBase]
  for (let bump = 0; bump < dayInBlock; bump++) {
    const setIndex = numSets - 1 - bump
    result[setIndex] += 1
  }

  return result
}

/**
 * Converts a cycle day (1–30, with rest days at 6,12,18,24,30) to
 * a 0-based working day index (0–24).
 */
export function cycleDayToWorkingIndex(cycleDay: number): number {
  let workingIndex = 0
  for (let d = 1; d < cycleDay; d++) {
    if (!isRestDay(d)) workingIndex++
  }
  return workingIndex
}

// ─── Date / cycle tracking ────────────────────────────────────────────────────

/**
 * Returns the logical date string (YYYY-MM-DD) for "today" given a reset hour.
 * If resetHour is 4 (4 AM), then at 3 AM on Tuesday, the logical day is still Monday.
 */
export function getLogicalDateString(now: Date, resetHour: number): string {
  const adjusted = new Date(now)
  // If current hour is before reset hour, we're still in the "previous" logical day
  if (now.getHours() < resetHour) {
    adjusted.setDate(adjusted.getDate() - 1)
  }
  const y = adjusted.getFullYear()
  const m = String(adjusted.getMonth() + 1).padStart(2, '0')
  const d = String(adjusted.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns true if `dateStr` (YYYY-MM-DD) is before the current logical day.
 */
export function isBeforeToday(dateStr: string, now: Date, resetHour: number): boolean {
  return dateStr < getLogicalDateString(now, resetHour)
}

/**
 * Given the last completed DayLog and whether it was completed,
 * returns the cycle day the user should be on today.
 *
 * Rules:
 * - If last log is for today → same cycle day (session in progress or done)
 * - If last log is for a previous day AND completed → advance to next working day
 * - If last log is for a previous day AND NOT completed → stay on same cycle day (retry)
 */
export function resolveCycleDay(
  lastLog: { cycleDay: number; completed: boolean; date: string } | null,
  now: Date,
  resetHour: number
): number {
  if (!lastLog) return 1 // first time

  const todayStr = getLogicalDateString(now, resetHour)

  if (lastLog.date === todayStr) {
    // Already have a log for today — same cycle day
    return lastLog.cycleDay
  }

  if (lastLog.completed) {
    return getNextWorkingDay(lastLog.cycleDay)
  } else {
    // Incomplete day → retry same day
    return lastLog.cycleDay
  }
}

// ─── Streak calculation ───────────────────────────────────────────────────────

/**
 * Counts consecutive days (going back from the most recent) where the exercise
 * was completed. Rest days are counted as "free" (streak is not broken).
 *
 * @param logs - All DayLogs for a specific exercise, in any order
 * @param now - Current date
 * @param resetHour - User's daily reset hour
 */
export function calculateStreak(
  logs: Array<{ cycleDay: number; completed: boolean; date: string }>,
  now: Date,
  resetHour: number
): number {
  const todayStr = getLogicalDateString(now, resetHour)

  // Sort logs descending by date
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) return 0

  let streak = 0
  let expectedDate: string | null = null

  for (const log of sorted) {
    // Skip future dates (shouldn't happen, but be safe)
    if (log.date > todayStr) continue

    if (expectedDate === null) {
      // First log — check it's today or yesterday (streak still alive)
      if (log.date < todayStr) {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = getLogicalDateString(yesterday, resetHour)
        if (log.date !== yesterdayStr && !log.completed) break
      }
      if (isRestDay(log.cycleDay)) {
        // Rest day doesn't add to streak but doesn't break it
        expectedDate = getPreviousDateString(log.date)
        continue
      }
      if (!log.completed) break
      streak++
      expectedDate = getPreviousDateString(log.date)
    } else {
      if (log.date !== expectedDate) break
      if (isRestDay(log.cycleDay)) {
        expectedDate = getPreviousDateString(log.date)
        continue
      }
      if (!log.completed) break
      streak++
      expectedDate = getPreviousDateString(log.date)
    }
  }

  return streak
}

function getPreviousDateString(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00') // noon to avoid DST issues
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
