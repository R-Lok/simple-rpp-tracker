import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatResetHour, ALL_RESET_HOUR_OPTIONS } from '@/lib/time'
import type { UserProfile } from '@/types'

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void
}

type Step = 'name' | 'reset-time' | 'theme'

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [resetHour, setResetHour] = useState('0')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const handleNameNext = () => {
    if (name.trim()) setStep('reset-time')
  }

  const handleResetNext = () => {
    setStep('theme')
  }

  const handleComplete = () => {
    onComplete({
      name: name.trim(),
      dailyResetHour: parseInt(resetHour, 10),
      theme,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {(['name', 'reset-time', 'theme'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full transition-colors ${
                step === s
                  ? 'bg-primary'
                  : (['name', 'reset-time', 'theme'] as Step[]).indexOf(step) > i
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 'name' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to RPP Tracker</CardTitle>
              <CardDescription>
                Track your Russian Fighter Pull-up Program progress. Let's get you set up.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameNext()}
                  autoFocus
                />
              </div>
              <Button
                className="w-full"
                onClick={handleNameNext}
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'reset-time' && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Reset Time</CardTitle>
              <CardDescription>
                When does your "day" reset? The app uses this to determine when you start a new day's workout.
                Default is midnight.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Reset time</Label>
                <Select value={resetHour} onValueChange={setResetHour}>
                  <SelectTrigger>
                    <SelectValue>{formatResetHour(parseInt(resetHour, 10))}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_RESET_HOUR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('name')}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleResetNext}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'theme' && (
          <Card>
            <CardHeader>
              <CardTitle>Choose a Theme</CardTitle>
              <CardDescription>You can change this later in settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    theme === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-xl mb-1">☀️</div>
                  <div className="font-medium text-sm">Light</div>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-xl mb-1">🌙</div>
                  <div className="font-medium text-sm">Dark</div>
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('reset-time')}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleComplete}>
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
