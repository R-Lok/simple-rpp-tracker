import { Dumbbell, Flame, Play, RotateCcw, Coffee, MoreVertical, Pause, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import type { Exercise, DayLog } from '@/types'
import { isRestDay } from '@/lib/rpp'

type ExerciseStatus = 'pending' | 'in-progress' | 'done' | 'rest'

interface ExerciseCardProps {
  exercise: Exercise
  todayLog: DayLog | null
  streak: number
  cycleDay: number
  onStartSession: () => void
  onTogglePause: () => void
  onDelete: () => void
}

function getStatus(todayLog: DayLog | null, cycleDay: number): ExerciseStatus {
  if (isRestDay(cycleDay)) return 'rest'
  if (!todayLog) return 'pending'
  if (todayLog.completed) return 'done'
  if (todayLog.completedSets > 0) return 'in-progress'
  return 'pending'
}

export function ExerciseCard({
  exercise,
  todayLog,
  streak,
  cycleDay,
  onStartSession,
  onTogglePause,
  onDelete,
}: ExerciseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const status = getStatus(todayLog, cycleDay)

  const statusConfig = {
    pending: { label: 'Not started', variant: 'outline' as const, color: '' },
    'in-progress': { label: 'In progress', variant: 'warning' as const, color: 'text-yellow-600' },
    done: { label: 'Done', variant: 'success' as const, color: 'text-green-600' },
    rest: { label: 'Rest day', variant: 'secondary' as const, color: '' },
  }

  const { label, variant } = statusConfig[status]

  const setsRemaining =
    todayLog && !todayLog.completed
      ? todayLog.sets.length - todayLog.completedSets
      : null

  return (
    <Card className={exercise.paused ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: icon + name + meta */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 shrink-0">
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{exercise.name}</h3>
                {exercise.paused && (
                  <Badge variant="secondary" className="text-xs">Paused</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>Day {cycleDay}</span>
                <span>·</span>
                <span>{exercise.maxRep}RM</span>
                {streak > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      {streak}
                    </span>
                  </>
                )}
              </div>
              {setsRemaining !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  {todayLog!.completedSets}/{todayLog!.sets.length} sets done
                </p>
              )}
            </div>
          </div>

          {/* Right: status badge + action + menu */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={variant}>{label}</Badge>

            {status === 'rest' ? (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Coffee className="h-4 w-4" />
              </div>
            ) : status === 'done' ? null : !exercise.paused ? (
              <Button
                size="sm"
                variant={status === 'in-progress' ? 'outline' : 'default'}
                onClick={onStartSession}
                className="gap-1"
              >
                {status === 'in-progress' ? (
                  <><RotateCcw className="h-3.5 w-3.5" /> Resume</>
                ) : (
                  <><Play className="h-3.5 w-3.5" /> Start</>
                )}
              </Button>
            ) : null}

            {/* Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMenuOpen(true)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Options dialog */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>{exercise.name}</DialogTitle>
            <DialogDescription>Manage this exercise</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => { onTogglePause(); setMenuOpen(false) }}
            >
              <Pause className="h-4 w-4" />
              {exercise.paused ? 'Resume exercise' : 'Pause exercise'}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="justify-start gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete exercise
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{exercise.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this exercise and all its history. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => { onDelete(); setMenuOpen(false) }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMenuOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
