import { describe, it, expect } from 'vitest'
import {
  isRestDay,
  getNextWorkingDay,
  getSetsForDay,
  getBasePattern,
  cycleDayToWorkingIndex,
  getLogicalDateString,
  isBeforeToday,
  resolveCycleDay,
  calculateStreak,
} from './rpp'

// ─── isRestDay ────────────────────────────────────────────────────────────────

describe('isRestDay', () => {
  it('marks days 6, 12, 18, 24, 30 as rest days', () => {
    expect(isRestDay(6)).toBe(true)
    expect(isRestDay(12)).toBe(true)
    expect(isRestDay(18)).toBe(true)
    expect(isRestDay(24)).toBe(true)
    expect(isRestDay(30)).toBe(true)
  })

  it('marks all other days 1–30 as working days', () => {
    const restDays = new Set([6, 12, 18, 24, 30])
    for (let d = 1; d <= 30; d++) {
      expect(isRestDay(d)).toBe(restDays.has(d))
    }
  })
})

// ─── getNextWorkingDay ────────────────────────────────────────────────────────

describe('getNextWorkingDay', () => {
  it('skips rest day 6 → returns 7', () => {
    expect(getNextWorkingDay(5)).toBe(7)
  })

  it('day 11 → 13 (skips 12)', () => {
    expect(getNextWorkingDay(11)).toBe(13)
  })

  it('day 29 → 1 (wraps around, skipping day 30)', () => {
    expect(getNextWorkingDay(29)).toBe(1)
  })

  it('day 30 (rest) → 1', () => {
    expect(getNextWorkingDay(30)).toBe(1)
  })

  it('day 1 → 2', () => {
    expect(getNextWorkingDay(1)).toBe(2)
  })
})

// ─── getBasePattern ───────────────────────────────────────────────────────────

describe('getBasePattern', () => {
  it('3 RM → [3, 2, 1, 1]', () => {
    expect(getBasePattern(3)).toEqual([3, 2, 1, 1])
  })

  it('5 RM → [5, 4, 3, 2, 1]', () => {
    expect(getBasePattern(5)).toEqual([5, 4, 3, 2, 1])
  })

  it('all sets are positive integers', () => {
    for (let rm = 1; rm <= 30; rm++) {
      const sets = getBasePattern(rm)
      expect(sets.length).toBeGreaterThan(0)
      sets.forEach((s) => expect(s).toBeGreaterThan(0))
    }
  })

  it('sets are in descending order', () => {
    for (let rm = 5; rm <= 30; rm++) {
      const sets = getBasePattern(rm)
      for (let i = 1; i < sets.length; i++) {
        expect(sets[i]).toBeLessThanOrEqual(sets[i - 1])
      }
    }
  })
})

// ─── getSetsForDay — 5RM program (verified against article table) ──────────────

describe('getSetsForDay — 5 RM', () => {
  // From the article:
  // Day 1: 5, 4, 3, 2, 1
  // Day 2: 5, 4, 3, 2, 2
  // Day 3: 5, 4, 3, 3, 2
  // Day 4: 5, 4, 4, 3, 2
  // Day 5: 5, 5, 4, 3, 2
  // Day 6: rest
  // Day 7: 6, 5, 4, 3, 2
  // Day 8: 6, 5, 4, 3, 3
  // Day 9: 6, 5, 4, 4, 3
  // Day 10: 6, 5, 5, 4, 3
  // Day 11: 6, 6, 5, 4, 3
  // Day 12: rest
  // Day 13: 7, 6, 5, 4, 3

  it('Day 1 → [5, 4, 3, 2, 1]', () => {
    expect(getSetsForDay(5, 1)).toEqual([5, 4, 3, 2, 1])
  })

  it('Day 2 → [5, 4, 3, 2, 2]', () => {
    expect(getSetsForDay(5, 2)).toEqual([5, 4, 3, 2, 2])
  })

  it('Day 3 → [5, 4, 3, 3, 2]', () => {
    expect(getSetsForDay(5, 3)).toEqual([5, 4, 3, 3, 2])
  })

  it('Day 4 → [5, 4, 4, 3, 2]', () => {
    expect(getSetsForDay(5, 4)).toEqual([5, 4, 4, 3, 2])
  })

  it('Day 5 → [5, 5, 4, 3, 2]', () => {
    expect(getSetsForDay(5, 5)).toEqual([5, 5, 4, 3, 2])
  })

  it('Day 6 → [] (rest day)', () => {
    expect(getSetsForDay(5, 6)).toEqual([])
  })

  it('Day 7 → [6, 5, 4, 3, 2]', () => {
    expect(getSetsForDay(5, 7)).toEqual([6, 5, 4, 3, 2])
  })

  it('Day 8 → [6, 5, 4, 3, 3]', () => {
    expect(getSetsForDay(5, 8)).toEqual([6, 5, 4, 3, 3])
  })

  it('Day 9 → [6, 5, 4, 4, 3]', () => {
    expect(getSetsForDay(5, 9)).toEqual([6, 5, 4, 4, 3])
  })

  it('Day 10 → [6, 5, 5, 4, 3]', () => {
    expect(getSetsForDay(5, 10)).toEqual([6, 5, 5, 4, 3])
  })

  it('Day 11 → [6, 6, 5, 4, 3]', () => {
    expect(getSetsForDay(5, 11)).toEqual([6, 6, 5, 4, 3])
  })

  it('Day 12 → [] (rest day)', () => {
    expect(getSetsForDay(5, 12)).toEqual([])
  })

  it('Day 13 → [7, 6, 5, 4, 3]', () => {
    expect(getSetsForDay(5, 13)).toEqual([7, 6, 5, 4, 3])
  })
})

// ─── getSetsForDay — rest days always return [] ────────────────────────────

describe('getSetsForDay — rest days', () => {
  const restDays = [6, 12, 18, 24, 30]
  restDays.forEach((day) => {
    it(`Day ${day} → [] for any RM`, () => {
      expect(getSetsForDay(5, day)).toEqual([])
      expect(getSetsForDay(15, day)).toEqual([])
    })
  })
})

// ─── cycleDayToWorkingIndex ───────────────────────────────────────────────────

describe('cycleDayToWorkingIndex', () => {
  it('day 1 → index 0', () => expect(cycleDayToWorkingIndex(1)).toBe(0))
  it('day 5 → index 4', () => expect(cycleDayToWorkingIndex(5)).toBe(4))
  it('day 7 → index 5 (skipping rest day 6)', () => expect(cycleDayToWorkingIndex(7)).toBe(5))
  it('day 13 → index 10', () => expect(cycleDayToWorkingIndex(13)).toBe(10))
})

// ─── getLogicalDateString ─────────────────────────────────────────────────────

describe('getLogicalDateString', () => {
  it('returns today\'s date when hour >= resetHour', () => {
    const now = new Date('2024-03-15T10:00:00') // 10 AM, reset at 0
    expect(getLogicalDateString(now, 0)).toBe('2024-03-15')
  })

  it('returns previous day when hour < resetHour (4 AM reset, it\'s 3 AM)', () => {
    const now = new Date('2024-03-15T03:00:00')
    expect(getLogicalDateString(now, 4)).toBe('2024-03-14')
  })

  it('returns same day when hour === resetHour', () => {
    const now = new Date('2024-03-15T04:00:00')
    expect(getLogicalDateString(now, 4)).toBe('2024-03-15')
  })
})

// ─── isBeforeToday ────────────────────────────────────────────────────────────

describe('isBeforeToday', () => {
  it('returns true for a date before today', () => {
    const now = new Date('2024-03-15T10:00:00')
    expect(isBeforeToday('2024-03-14', now, 0)).toBe(true)
  })

  it('returns false for today', () => {
    const now = new Date('2024-03-15T10:00:00')
    expect(isBeforeToday('2024-03-15', now, 0)).toBe(false)
  })

  it('returns false for future date', () => {
    const now = new Date('2024-03-15T10:00:00')
    expect(isBeforeToday('2024-03-16', now, 0)).toBe(false)
  })
})

// ─── resolveCycleDay ──────────────────────────────────────────────────────────

describe('resolveCycleDay', () => {
  const now = new Date('2024-03-15T10:00:00')
  const today = '2024-03-15'
  const yesterday = '2024-03-14'

  it('returns 1 when there is no last log', () => {
    expect(resolveCycleDay(null, now, 0)).toBe(1)
  })

  it('returns same cycleDay when last log is today (in-progress or done)', () => {
    expect(resolveCycleDay({ cycleDay: 3, completed: false, date: today }, now, 0)).toBe(3)
    expect(resolveCycleDay({ cycleDay: 3, completed: true, date: today }, now, 0)).toBe(3)
  })

  it('advances to next working day when yesterday was completed', () => {
    const result = resolveCycleDay({ cycleDay: 5, completed: true, date: yesterday }, now, 0)
    expect(result).toBe(7) // day 5 → next working day skips rest day 6 → 7
  })

  it('stays on same cycleDay when yesterday was NOT completed (retry)', () => {
    const result = resolveCycleDay({ cycleDay: 5, completed: false, date: yesterday }, now, 0)
    expect(result).toBe(5)
  })

  it('advances normally when previous day was completed (no rest day skip needed)', () => {
    const result = resolveCycleDay({ cycleDay: 3, completed: true, date: yesterday }, now, 0)
    expect(result).toBe(4)
  })
})

// ─── calculateStreak ─────────────────────────────────────────────────────────

describe('calculateStreak', () => {
  const now = new Date('2024-03-15T10:00:00')

  it('returns 0 for no logs', () => {
    expect(calculateStreak([], now, 0)).toBe(0)
  })

  it('returns 1 for a single completed log today', () => {
    expect(
      calculateStreak([{ cycleDay: 1, completed: true, date: '2024-03-15' }], now, 0)
    ).toBe(1)
  })

  it('returns 0 when today\'s log is not completed', () => {
    expect(
      calculateStreak([{ cycleDay: 1, completed: false, date: '2024-03-15' }], now, 0)
    ).toBe(0)
  })

  it('counts consecutive completed days', () => {
    const logs = [
      { cycleDay: 3, completed: true, date: '2024-03-15' },
      { cycleDay: 2, completed: true, date: '2024-03-14' },
      { cycleDay: 1, completed: true, date: '2024-03-13' },
    ]
    expect(calculateStreak(logs, now, 0)).toBe(3)
  })

  it('stops at an incomplete day', () => {
    const logs = [
      { cycleDay: 3, completed: true, date: '2024-03-15' },
      { cycleDay: 2, completed: false, date: '2024-03-14' },
      { cycleDay: 1, completed: true, date: '2024-03-13' },
    ]
    expect(calculateStreak(logs, now, 0)).toBe(1)
  })
})
