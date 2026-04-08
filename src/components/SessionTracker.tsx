import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, CheckCircle2, Trophy, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import type { Exercise, DayLog } from '@/types'
import {
  requestNotificationPermission,
  scheduleNotification,
  isNotificationSupported,
  isNotificationGranted,
  ONE_HOUR_MS,
} from '@/lib/notifications'

interface SessionTrackerProps {
  exercise: Exercise
  log: DayLog
  onSetComplete: (setIndex: number) => void
  onBack: () => void
}

export function SessionTracker({ exercise, log, onSetComplete, onBack }: SessionTrackerProps) {
  const currentSetIndex = log.completedSets
  const totalSets = log.sets.length
  const isComplete = log.completed

  const [notifEnabled, setNotifEnabled] = useState(isNotificationGranted())
  const notifTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up notification timeout on unmount
  useEffect(() => {
    return () => {
      if (notifTimeoutRef.current !== null) {
        clearTimeout(notifTimeoutRef.current)
      }
    }
  }, [])

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    setNotifEnabled(granted)
  }

  const handleSetDone = () => {
    // Cancel any pending notification
    if (notifTimeoutRef.current !== null) {
      clearTimeout(notifTimeoutRef.current)
      notifTimeoutRef.current = null
    }

    onSetComplete(currentSetIndex)

    // Schedule next notification if this isn't the last set
    const nextSetIndex = currentSetIndex + 1
    if (nextSetIndex < totalSets && notifEnabled) {
      notifTimeoutRef.current = scheduleNotification(
        'RPP Tracker',
        `Time for set ${nextSetIndex + 1} of ${totalSets} — ${log.sets[nextSetIndex]} reps of ${exercise.name}`,
        ONE_HOUR_MS
      )
    }
  }

  const progressPercent = (log.completedSets / totalSets) * 100

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex justify-center">
            <Trophy className="h-20 w-20 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Done!</h1>
            <p className="text-muted-foreground mt-2">
              You completed all {totalSets} sets of {exercise.name} for today.
            </p>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            {log.sets.map((reps, i) => (
              <div key={i} className="flex justify-between items-center px-4">
                <span>Set {i + 1}</span>
                <span className="font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  {reps} reps
                </span>
              </div>
            ))}
          </div>
          <Button className="w-full" size="lg" onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const currentReps = log.sets[currentSetIndex]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{exercise.name}</h1>
            <p className="text-xs text-muted-foreground">Day {log.cycleDay} · {exercise.maxRep}RM</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Set {currentSetIndex + 1} of {totalSets}</span>
            <span>{log.completedSets} done</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Current set */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm uppercase tracking-wide">Reps this set</p>
          <div className="text-8xl font-bold tabular-nums leading-none">{currentReps}</div>
          <p className="text-muted-foreground">{exercise.name}</p>
        </div>

        {/* All sets overview */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {log.sets.map((reps, i) => (
                <div
                  key={i}
                  className={`text-center rounded-md py-2 text-sm transition-colors ${
                    i < log.completedSets
                      ? 'bg-primary/10 text-primary font-medium'
                      : i === currentSetIndex
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="text-xs opacity-70">S{i + 1}</div>
                  <div>{reps}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Done button */}
        <Button
          size="xl"
          className="w-full text-lg"
          onClick={handleSetDone}
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Done — {currentReps} reps complete
        </Button>

        {/* Notification opt-in */}
        {isNotificationSupported() && (
          <div className="text-center">
            {notifEnabled ? (
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Bell className="h-3.5 w-3.5" />
                You'll be notified in 1 hour for the next set
                <span className="text-xs">(requires tab to stay open)</span>
              </p>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1 text-muted-foreground"
                onClick={handleEnableNotifications}
              >
                <BellOff className="h-3.5 w-3.5" />
                Enable 1-hour reminders
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
