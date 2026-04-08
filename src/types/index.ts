// ─── Core domain types ────────────────────────────────────────────────────────

export interface UserProfile {
  name: string
  /** Hour (0–23) at which the "day" resets. Default: 0 (midnight) */
  dailyResetHour: number
  theme: 'light' | 'dark'
  createdAt: string
}

export interface Exercise {
  id: string
  name: string
  /** The user's current rep max when they started tracking this exercise */
  maxRep: number
  /** ISO date string — when the exercise was added */
  createdAt: string
  /** If true, exercise is hidden from dashboard but history is preserved */
  paused: boolean
}

export interface DayLog {
  exerciseId: string
  /** Which day of the 30-day RPP cycle this log covers (1–30) */
  cycleDay: number
  /** Reps per set for this day, computed from maxRep + cycleDay */
  sets: number[]
  /** How many sets the user has confirmed complete */
  completedSets: number
  /** True when all sets are done */
  completed: boolean
  /** ISO date string (YYYY-MM-DD) for the logical day this log belongs to */
  date: string
}

export interface AppState {
  profile: UserProfile | null
  exercises: Exercise[]
  /** All day logs, ordered by date descending (latest first) */
  logs: DayLog[]
}

// ─── UI / navigation ──────────────────────────────────────────────────────────

export type Screen = 'onboarding' | 'dashboard' | 'session' | 'settings'

export interface ActiveSession {
  exerciseId: string
  /** The DayLog being worked through */
  log: DayLog
}
