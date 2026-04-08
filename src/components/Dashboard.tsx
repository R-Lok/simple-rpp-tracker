import { Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExerciseCard } from '@/components/ExerciseCard'
import { AddExerciseModal } from '@/components/AddExerciseModal'
import { useState } from 'react'
import type { Exercise, DayLog, Screen } from '@/types'

interface DashboardProps {
  userName: string
  exercises: Exercise[]
  todayLogs: Record<string, DayLog | null>   // exerciseId → today's log
  streaks: Record<string, number>             // exerciseId → streak count
  cycleDays: Record<string, number>           // exerciseId → current cycle day
  completedToday: number
  totalActive: number
  onAddExercise: (ex: Omit<Exercise, 'id' | 'createdAt'>) => void
  onStartSession: (exerciseId: string) => void
  onTogglePause: (exerciseId: string) => void
  onDeleteExercise: (exerciseId: string) => void
  onNavigate: (screen: Screen) => void
}

export function Dashboard({
  userName,
  exercises,
  todayLogs,
  streaks,
  cycleDays,
  completedToday,
  totalActive,
  onAddExercise,
  onStartSession,
  onTogglePause,
  onDeleteExercise,
  onNavigate,
}: DashboardProps) {
  const [addOpen, setAddOpen] = useState(false)

  const active = exercises.filter((e) => !e.paused)
  const paused = exercises.filter((e) => e.paused)

  const greeting = getGreeting()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">RPP Tracker</h1>
            <p className="text-xs text-muted-foreground">
              {greeting}, {userName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('settings')}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        {totalActive > 0 && (
          <div className="rounded-lg bg-muted px-4 py-3 text-sm">
            <span className="font-medium">{completedToday}/{totalActive}</span>
            <span className="text-muted-foreground"> exercises done today</span>
          </div>
        )}

        {/* Active exercises */}
        <section className="space-y-3">
          {active.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Exercises
              </h2>
              <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          )}

          {active.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-muted-foreground">No exercises yet.</p>
              <Button onClick={() => setAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add your first exercise
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {active.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  todayLog={todayLogs[ex.id] ?? null}
                  streak={streaks[ex.id] ?? 0}
                  cycleDay={cycleDays[ex.id] ?? 1}
                  onStartSession={() => onStartSession(ex.id)}
                  onTogglePause={() => onTogglePause(ex.id)}
                  onDelete={() => onDeleteExercise(ex.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Paused exercises */}
        {paused.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Paused
            </h2>
            <div className="space-y-2">
              {paused.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  todayLog={todayLogs[ex.id] ?? null}
                  streak={streaks[ex.id] ?? 0}
                  cycleDay={cycleDays[ex.id] ?? 1}
                  onStartSession={() => onStartSession(ex.id)}
                  onTogglePause={() => onTogglePause(ex.id)}
                  onDelete={() => onDeleteExercise(ex.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Program info */}
        {exercises.length > 0 && (
          <p className="text-xs text-center text-muted-foreground pb-4">
            Russian Fighter Pull-up Program · 30-day cycle
          </p>
        )}
      </main>

      <AddExerciseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={onAddExercise}
      />
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
