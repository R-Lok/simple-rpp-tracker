import { useState, useEffect, useCallback } from 'react'
import { OnboardingFlow } from '@/components/OnboardingFlow'
import { Dashboard } from '@/components/Dashboard'
import { SessionTracker } from '@/components/SessionTracker'
import { Settings } from '@/components/Settings'
import { localStorageAdapter } from '@/lib/storage'
import {
  getSetsForDay,
  getLogicalDateString,
  resolveCycleDay,
  calculateStreak,
  isRestDay,
} from '@/lib/rpp'
import type { AppState, Screen, Exercise, DayLog, UserProfile } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

const storage = localStorageAdapter

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => storage.getState())
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null)

  // Apply theme on mount and whenever profile changes
  useEffect(() => {
    if (appState.profile) {
      applyTheme(appState.profile.theme)
    }
  }, [appState.profile?.theme])

  // Determine if onboarding is needed
  const needsOnboarding = !appState.profile

  // ─── Derived state ──────────────────────────────────────────────────────────

  const now = new Date()
  const resetHour = appState.profile?.dailyResetHour ?? 0
  const todayStr = getLogicalDateString(now, resetHour)

  /**
   * For each exercise, determine:
   * - The current cycle day (applying daily reset logic)
   * - Today's log (if any)
   * - Streak
   */
  const exerciseData = useCallback(() => {
    const cycleDays: Record<string, number> = {}
    const todayLogs: Record<string, DayLog | null> = {}
    const streaks: Record<string, number> = {}

    for (const exercise of appState.exercises) {
      const exerciseLogs = appState.logs.filter((l) => l.exerciseId === exercise.id)

      // Sort logs by date descending
      const sorted = [...exerciseLogs].sort((a, b) => b.date.localeCompare(a.date))
      const lastLog = sorted[0] ?? null

      const cycleDay = resolveCycleDay(lastLog, now, resetHour)
      cycleDays[exercise.id] = cycleDay

      // Today's log: the one with today's date
      const todayLog = exerciseLogs.find((l) => l.date === todayStr) ?? null
      todayLogs[exercise.id] = todayLog

      streaks[exercise.id] = calculateStreak(exerciseLogs, now, resetHour)
    }

    return { cycleDays, todayLogs, streaks }
  }, [appState, todayStr, resetHour]) // eslint-disable-line react-hooks/exhaustive-deps

  const { cycleDays, todayLogs, streaks } = exerciseData()

  // Summary counts
  const activeExercises = appState.exercises.filter((e) => !e.paused)
  const completedToday = activeExercises.filter((e) => {
    const log = todayLogs[e.id]
    return log?.completed === true
  }).length

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleOnboardingComplete = (profile: UserProfile) => {
    storage.updateProfile(profile)
    applyTheme(profile.theme)
    setAppState(storage.getState())
    setScreen('dashboard')
  }

  const handleAddExercise = (ex: Omit<Exercise, 'id' | 'createdAt'>) => {
    const exercise: Exercise = {
      ...ex,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    storage.addExercise(exercise)
    setAppState(storage.getState())
  }

  const handleStartSession = (exerciseId: string) => {
    const exercise = appState.exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    const cycleDay = cycleDays[exerciseId]
    if (isRestDay(cycleDay)) return

    // Get or create today's log
    let todayLog = todayLogs[exerciseId]
    if (!todayLog) {
      const sets = getSetsForDay(exercise.maxRep, cycleDay)
      todayLog = {
        exerciseId,
        cycleDay,
        sets,
        completedSets: 0,
        completed: false,
        date: todayStr,
      }
      storage.upsertLog(todayLog)
      setAppState(storage.getState())
    }

    setActiveExerciseId(exerciseId)
    setScreen('session')
  }

  const handleSetComplete = (setIndex: number) => {
    if (!activeExerciseId) return
    const currentLog = todayLogs[activeExerciseId]
    if (!currentLog) return

    const newCompletedSets = setIndex + 1
    const updatedLog: DayLog = {
      ...currentLog,
      completedSets: newCompletedSets,
      completed: newCompletedSets >= currentLog.sets.length,
    }

    storage.upsertLog(updatedLog)
    setAppState(storage.getState())
  }

  const handleTogglePause = (exerciseId: string) => {
    const exercise = appState.exercises.find((e) => e.id === exerciseId)
    if (!exercise) return
    storage.updateExercise({ ...exercise, paused: !exercise.paused })
    setAppState(storage.getState())
  }

  const handleDeleteExercise = (exerciseId: string) => {
    const state = storage.getState()
    storage.setState({
      ...state,
      exercises: state.exercises.filter((e) => e.id !== exerciseId),
      logs: state.logs.filter((l) => l.exerciseId !== exerciseId),
    })
    setAppState(storage.getState())
    if (activeExerciseId === exerciseId) {
      setActiveExerciseId(null)
      setScreen('dashboard')
    }
  }

  const handleSaveProfile = (profile: UserProfile) => {
    storage.updateProfile(profile)
    applyTheme(profile.theme)
    setAppState(storage.getState())
    setScreen('dashboard')
  }

  const handleResetAll = () => {
    storage.clearAll()
    applyTheme('light')
    setAppState(storage.getState())
    setScreen('dashboard')
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (needsOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  const profile = appState.profile!

  if (screen === 'session' && activeExerciseId) {
    const exercise = appState.exercises.find((e) => e.id === activeExerciseId)
    const log = todayLogs[activeExerciseId]

    if (exercise && log) {
      return (
        <SessionTracker
          exercise={exercise}
          log={log}
          onSetComplete={handleSetComplete}
          onBack={() => setScreen('dashboard')}
        />
      )
    }
    // Fallback if log is missing (shouldn't happen)
    setScreen('dashboard')
  }

  if (screen === 'settings') {
    return (
      <Settings
        profile={profile}
        onSave={handleSaveProfile}
        onResetAll={handleResetAll}
        onNavigate={setScreen}
      />
    )
  }

  // Default: dashboard
  return (
    <Dashboard
      userName={profile.name}
      exercises={appState.exercises}
      todayLogs={todayLogs}
      streaks={streaks}
      cycleDays={cycleDays}
      completedToday={completedToday}
      totalActive={activeExercises.length}
      onAddExercise={handleAddExercise}
      onStartSession={handleStartSession}
      onTogglePause={handleTogglePause}
      onDeleteExercise={handleDeleteExercise}
      onNavigate={setScreen}
    />
  )
}
