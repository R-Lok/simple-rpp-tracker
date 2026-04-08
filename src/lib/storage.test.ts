import { describe, it, expect, beforeEach } from 'vitest'
import { createMemoryAdapter, defaultAppState } from './storage'
import type { Exercise, DayLog, UserProfile } from '@/types'

const makeProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  name: 'Test User',
  dailyResetHour: 0,
  theme: 'light',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

const makeExercise = (overrides?: Partial<Exercise>): Exercise => ({
  id: 'ex-1',
  name: 'Pull-ups',
  maxRep: 5,
  createdAt: '2024-01-01T00:00:00.000Z',
  paused: false,
  ...overrides,
})

const makeLog = (overrides?: Partial<DayLog>): DayLog => ({
  exerciseId: 'ex-1',
  cycleDay: 1,
  sets: [5, 4, 3, 2, 1],
  completedSets: 0,
  completed: false,
  date: '2024-03-15',
  ...overrides,
})

// ─── defaultAppState ──────────────────────────────────────────────────────────

describe('defaultAppState', () => {
  it('returns null profile, empty exercises and logs', () => {
    const state = defaultAppState()
    expect(state.profile).toBeNull()
    expect(state.exercises).toEqual([])
    expect(state.logs).toEqual([])
  })
})

// ─── createMemoryAdapter ──────────────────────────────────────────────────────

describe('createMemoryAdapter', () => {
  let adapter: ReturnType<typeof createMemoryAdapter>

  beforeEach(() => {
    adapter = createMemoryAdapter()
  })

  // getState / setState
  describe('getState / setState', () => {
    it('returns default state when empty', () => {
      expect(adapter.getState()).toEqual(defaultAppState())
    })

    it('returns state that was set', () => {
      const state = { profile: makeProfile(), exercises: [], logs: [] }
      adapter.setState(state)
      expect(adapter.getState()).toEqual(state)
    })

    it('getState returns a deep copy (mutations do not affect stored state)', () => {
      adapter.setState({ profile: makeProfile(), exercises: [], logs: [] })
      const state1 = adapter.getState()
      state1.exercises.push(makeExercise())
      expect(adapter.getState().exercises).toHaveLength(0)
    })
  })

  // updateProfile
  describe('updateProfile', () => {
    it('sets profile when none existed', () => {
      const profile = makeProfile()
      adapter.updateProfile(profile)
      expect(adapter.getState().profile).toEqual(profile)
    })

    it('replaces an existing profile', () => {
      adapter.updateProfile(makeProfile({ name: 'Alice' }))
      adapter.updateProfile(makeProfile({ name: 'Bob' }))
      expect(adapter.getState().profile?.name).toBe('Bob')
    })

    it('does not affect exercises or logs', () => {
      adapter.addExercise(makeExercise())
      adapter.updateProfile(makeProfile())
      expect(adapter.getState().exercises).toHaveLength(1)
    })
  })

  // addExercise
  describe('addExercise', () => {
    it('adds a new exercise', () => {
      adapter.addExercise(makeExercise())
      expect(adapter.getState().exercises).toHaveLength(1)
    })

    it('does not add a duplicate exercise (same id)', () => {
      adapter.addExercise(makeExercise())
      adapter.addExercise(makeExercise())
      expect(adapter.getState().exercises).toHaveLength(1)
    })

    it('can add multiple exercises with different ids', () => {
      adapter.addExercise(makeExercise({ id: 'ex-1' }))
      adapter.addExercise(makeExercise({ id: 'ex-2', name: 'Push-ups' }))
      expect(adapter.getState().exercises).toHaveLength(2)
    })
  })

  // updateExercise
  describe('updateExercise', () => {
    it('updates an existing exercise', () => {
      adapter.addExercise(makeExercise({ name: 'Pull-ups' }))
      adapter.updateExercise(makeExercise({ name: 'Chin-ups' }))
      expect(adapter.getState().exercises[0].name).toBe('Chin-ups')
    })

    it('is a no-op if exercise does not exist', () => {
      adapter.updateExercise(makeExercise())
      expect(adapter.getState().exercises).toHaveLength(0)
    })
  })

  // upsertLog
  describe('upsertLog', () => {
    it('inserts a new log', () => {
      adapter.upsertLog(makeLog())
      expect(adapter.getState().logs).toHaveLength(1)
    })

    it('replaces a log with the same exerciseId + date', () => {
      adapter.upsertLog(makeLog({ completedSets: 0 }))
      adapter.upsertLog(makeLog({ completedSets: 3 }))
      const logs = adapter.getState().logs
      expect(logs).toHaveLength(1)
      expect(logs[0].completedSets).toBe(3)
    })

    it('keeps logs for different dates separate', () => {
      adapter.upsertLog(makeLog({ date: '2024-03-14' }))
      adapter.upsertLog(makeLog({ date: '2024-03-15' }))
      expect(adapter.getState().logs).toHaveLength(2)
    })

    it('keeps logs for different exercises separate', () => {
      adapter.upsertLog(makeLog({ exerciseId: 'ex-1' }))
      adapter.upsertLog(makeLog({ exerciseId: 'ex-2' }))
      expect(adapter.getState().logs).toHaveLength(2)
    })
  })

  // clearAll
  describe('clearAll', () => {
    it('wipes all data', () => {
      adapter.updateProfile(makeProfile())
      adapter.addExercise(makeExercise())
      adapter.upsertLog(makeLog())
      adapter.clearAll()
      expect(adapter.getState()).toEqual(defaultAppState())
    })
  })

  // initialisation with data
  describe('initialisation with data', () => {
    it('accepts initial state', () => {
      const preloaded = createMemoryAdapter({
        exercises: [makeExercise()],
      })
      expect(preloaded.getState().exercises).toHaveLength(1)
    })
  })
})
