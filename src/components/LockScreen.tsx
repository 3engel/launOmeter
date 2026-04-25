import { useEffect, useState } from "react"
import { getRemainingLockMs } from "@/lib/lock"

interface Props {
  onDone: () => void
}

export function LockScreen({ onDone }: Props) {
  const [remaining, setRemaining] = useState(() =>
    Math.ceil(getRemainingLockMs() / 1000)
  )

  useEffect(() => {
    const tick = () => {
      const ms = getRemainingLockMs()
      const sec = Math.ceil(ms / 1000)
      setRemaining(sec)
      if (ms <= 0) {
        onDone()
      }
    }
    const id = window.setInterval(tick, 200)
    tick()
    return () => window.clearInterval(id)
  }, [onDone])

  return (
    <div className="flex flex-col items-center justify-center gap-10 min-h-[70vh] p-6 text-center">
      <span className="text-9xl" aria-hidden>
        🌟
      </span>
      <h1 className="text-5xl font-semibold tracking-tight">
        Viel Spaß in der Schule!
      </h1>
      <p className="text-xl text-muted-foreground">Danke für deine Stimme.</p>
      <div className="text-7xl font-mono tabular-nums text-primary">
        {remaining}
      </div>
      <p className="text-sm text-muted-foreground">
        Sekunden bis zur nächsten Stimmabgabe
      </p>
    </div>
  )
}
