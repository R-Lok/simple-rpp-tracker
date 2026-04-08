import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getBasePattern } from '@/lib/rpp'
import type { Exercise } from '@/types'

interface AddExerciseModalProps {
  open: boolean
  onClose: () => void
  onAdd: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void
}

export function AddExerciseModal({ open, onClose, onAdd }: AddExerciseModalProps) {
  const [name, setName] = useState('')
  const [maxRepStr, setMaxRepStr] = useState('')

  const maxRep = parseInt(maxRepStr, 10)
  const isValid = name.trim().length > 0 && Number.isInteger(maxRep) && maxRep >= 1 && maxRep <= 100

  const handleSubmit = () => {
    if (!isValid) return
    onAdd({ name: name.trim(), maxRep, paused: false })
    setName('')
    setMaxRepStr('')
    onClose()
  }

  const handleClose = () => {
    setName('')
    setMaxRepStr('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
          <DialogDescription>
            Enter your exercise name and your current max reps (your rep max / RM) — the most reps you can do in one set.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Exercise name</Label>
            <Input
              id="exercise-name"
              placeholder="e.g. Pull-ups, Push-ups, Dips"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-rep">Your current max reps (RM)</Label>
            <Input
              id="max-rep"
              type="number"
              min={1}
              max={100}
              placeholder="e.g. 5"
              value={maxRepStr}
              onChange={(e) => setMaxRepStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
            />
            {maxRepStr && !isValid && name.trim() && (
              <p className="text-sm text-destructive">Enter a number between 1 and 100</p>
            )}
            {isValid && (() => {
              const sets = getBasePattern(maxRep)
              return (
                <p className="text-sm text-muted-foreground">
                  Day 1 sets: <span className="font-medium text-foreground">{sets.join(' · ')}</span>
                </p>
              )
            })()}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Add Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
