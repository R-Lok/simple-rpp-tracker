import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>About the Program</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            The <span className="font-medium text-foreground">Russian Fighter Pull-up Program</span> is
            a high-frequency training method originally used in Russian military fitness preparation.
            It is designed to rapidly increase your pull-up (or any bodyweight) rep count over a 30-day cycle.
          </p>

          <div className="space-y-1.5">
            <p className="font-medium text-foreground">How it works</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>5 working days, then 1 rest day — repeated across 30 days</li>
              <li>Each day you perform 5 sets with decreasing reps</li>
              <li>Each day adds one more rep to one set, progressively building volume</li>
              <li>The leading set bumps up every 5 days</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <p className="font-medium text-foreground">Starting point</p>
            <p>
              Enter your current max reps (the most you can do in one set). The app calculates
              your daily sets automatically. After 30 days, rest 2–3 days and re-test —
              most people see a 2–3× improvement.
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="font-medium text-foreground">Incomplete days</p>
            <p>
              If you miss a day or don't finish, the app keeps you on the same day
              until you complete it — you don't lose progress, but you don't advance either.
            </p>
          </div>

          <div className="pt-1 border-t border-border">
            <p className="text-xs">
              Source &amp; inspiration:{' '}
              <a
                href="https://sealgrinderpt.com/fitness/russian-pull-up-program.html/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80"
              >
                SEALgrinderPT — Russian Fighter Pull-up Program
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
