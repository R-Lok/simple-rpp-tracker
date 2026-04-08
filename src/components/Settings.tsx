import { useState } from 'react'
import { ArrowLeft, Sun, Moon, Trash2, Info } from 'lucide-react'
import { AboutModal } from '@/components/AboutModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
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
import { formatResetHour, ALL_RESET_HOUR_OPTIONS } from '@/lib/time'
import type { UserProfile, Screen } from '@/types'

interface SettingsProps {
  profile: UserProfile
  onSave: (profile: UserProfile) => void
  onResetAll: () => void
  onNavigate: (screen: Screen) => void
}

export function Settings({ profile, onSave, onResetAll, onNavigate }: SettingsProps) {
  const [name, setName] = useState(profile.name)
  const [resetHour, setResetHour] = useState(String(profile.dailyResetHour))
  const [isDark, setIsDark] = useState(profile.theme === 'dark')
  const [aboutOpen, setAboutOpen] = useState(false)

  const isDirty =
    name.trim() !== profile.name ||
    parseInt(resetHour, 10) !== profile.dailyResetHour ||
    isDark !== (profile.theme === 'dark')

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      ...profile,
      name: name.trim(),
      dailyResetHour: parseInt(resetHour, 10),
      theme: isDark ? 'dark' : 'light',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('dashboard')}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile */}
        <section className="space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Profile
          </h2>

          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </section>

        <Separator />

        {/* Preferences */}
        <section className="space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Preferences
          </h2>

          <div className="space-y-2">
            <Label>Daily reset time</Label>
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
            <p className="text-xs text-muted-foreground">
              The "day" resets at this time. If you work out after midnight, set this to a time after your last workout.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark mode</Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={isDark}
                onCheckedChange={setIsDark}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* Save */}
        {isDirty && (
          <Button className="w-full" onClick={handleSave} disabled={!name.trim()}>
            Save Changes
          </Button>
        )}

        <Separator />

        {/* About */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setAboutOpen(true)}
        >
          <Info className="h-4 w-4" />
          About the Program
        </Button>

        <Separator />

        {/* Danger zone */}
        <section className="space-y-4">
          <h2 className="font-semibold text-sm text-destructive uppercase tracking-wide">
            Danger Zone
          </h2>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Reset All Progress
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your exercises, logs, and settings. You'll be taken back to the setup screen.
                  <br /><br />
                  <strong>This cannot be undone.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onResetAll}
                >
                  Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </main>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}
