/**
 * Storage abstraction layer.
 *
 * The app only talks to `StorageAdapter` — never to `localStorage` directly.
 * To switch to a backend, implement `StorageAdapter` and swap it in App.tsx.
 */

import type { AppState, Exercise, DayLog, UserProfile } from '@/types'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface StorageAdapter {
  /** Return the full app state, or a default empty state if nothing is stored */
  getState(): AppState
  /** Overwrite the full app state */
  setState(state: AppState): void
  /** Convenience: update only the user profile */
  updateProfile(profile: UserProfile): void
  /** Add a new exercise (no-op if ID already exists) */
  addExercise(exercise: Exercise): void
  /** Update an existing exercise by ID */
  updateExercise(exercise: Exercise): void
  /** Upsert a DayLog (insert or replace by exerciseId + date) */
  upsertLog(log: DayLog): void
  /** Wipe all stored data */
  clearAll(): void
}

// ─── Default state ────────────────────────────────────────────────────────────

export function defaultAppState(): AppState {
  return {
    profile: null,
    exercises: [],
    logs: [],
  }
}

// ─── localStorage adapter ─────────────────────────────────────────────────────

const STORAGE_KEY = 'rpp-tracker-state'

export const localStorageAdapter: StorageAdapter = {
  getState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultAppState()
      const parsed = JSON.parse(raw) as Partial<AppState>
      return {
        profile: parsed.profile ?? null,
        exercises: parsed.exercises ?? [],
        logs: parsed.logs ?? [],
      }
    } catch {
      return defaultAppState()
    }
  },

  setState(state: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  },

  updateProfile(profile: UserProfile): void {
    const state = this.getState()
    state.profile = profile
    this.setState(state)
  },

  addExercise(exercise: Exercise): void {
    const state = this.getState()
    const exists = state.exercises.some((e) => e.id === exercise.id)
    if (!exists) {
      state.exercises.push(exercise)
      this.setState(state)
    }
  },

  updateExercise(exercise: Exercise): void {
    const state = this.getState()
    const idx = state.exercises.findIndex((e) => e.id === exercise.id)
    if (idx !== -1) {
      state.exercises[idx] = exercise
      this.setState(state)
    }
  },

  upsertLog(log: DayLog): void {
    const state = this.getState()
    const idx = state.logs.findIndex(
      (l) => l.exerciseId === log.exerciseId && l.date === log.date
    )
    if (idx !== -1) {
      state.logs[idx] = log
    } else {
      state.logs.push(log)
    }
    this.setState(state)
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}

// ─── In-memory adapter (for testing) ─────────────────────────────────────────

export function createMemoryAdapter(initial?: Partial<AppState>): StorageAdapter {
  let state: AppState = {
    profile: initial?.profile ?? null,
    exercises: initial?.exercises ?? [],
    logs: initial?.logs ?? [],
  }

  return {
    getState(): AppState {
      return JSON.parse(JSON.stringify(state)) as AppState
    },

    setState(newState: AppState): void {
      state = JSON.parse(JSON.stringify(newState)) as AppState
    },

    updateProfile(profile: UserProfile): void {
      state = { ...state, profile }
    },

    addExercise(exercise: Exercise): void {
      const exists = state.exercises.some((e) => e.id === exercise.id)
      if (!exists) {
        state = { ...state, exercises: [...state.exercises, exercise] }
      }
    },

    updateExercise(exercise: Exercise): void {
      state = {
        ...state,
        exercises: state.exercises.map((e) => (e.id === exercise.id ? exercise : e)),
      }
    },

    upsertLog(log: DayLog): void {
      const idx = state.logs.findIndex(
        (l) => l.exerciseId === log.exerciseId && l.date === log.date
      )
      if (idx !== -1) {
        const logs = [...state.logs]
        logs[idx] = log
        state = { ...state, logs }
      } else {
        state = { ...state, logs: [...state.logs, log] }
      }
    },

    clearAll(): void {
      state = { profile: null, exercises: [], logs: [] }
    },
  }
}
