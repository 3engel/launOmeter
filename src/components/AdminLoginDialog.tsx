import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { hashPin } from "@/lib/crypto"
import { getSettings, setSetting } from "@/lib/db"
import { setAdminAuth } from "@/lib/admin"

type Mode = "loading" | "setup" | "prompt"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminLoginDialog({ open, onOpenChange }: Props) {
  const [mode, setMode] = useState<Mode>("loading")
  const [pinHash, setPinHash] = useState<string | undefined>()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    setMode("loading")
    let alive = true
    ;(async () => {
      const s = await getSettings()
      if (!alive) return
      setPinHash(s.pinHash)
      setMode(s.pinHash ? "prompt" : "setup")
    })()
    return () => {
      alive = false
    }
  }, [open])

  function handleSuccess() {
    setAdminAuth()
    onOpenChange(false)
    navigate("/admin")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {mode === "loading" && (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Lade…
          </div>
        )}
        {mode === "setup" && <SetupForm onSuccess={handleSuccess} />}
        {mode === "prompt" && pinHash && (
          <PromptForm pinHash={pinHash} onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PromptForm({
  pinHash,
  onSuccess,
}: {
  pinHash: string
  onSuccess: () => void
}) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const hash = await hashPin(pin)
      if (hash === pinHash) {
        onSuccess()
      } else {
        setError("Falsche PIN.")
        setPin("")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Admin-Anmeldung</DialogTitle>
        <DialogDescription>Bitte gib die Admin-PIN ein.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-pin">PIN</Label>
          <Input
            id="login-pin"
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="submit" disabled={busy || pin.length === 0}>
            Anmelden
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function SetupForm({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (pin.length < 4) {
      setError("Die PIN muss mindestens 4 Stellen haben.")
      return
    }
    if (pin !== confirm) {
      setError("Die PINs stimmen nicht überein.")
      return
    }
    setBusy(true)
    try {
      const hash = await hashPin(pin)
      await setSetting("pinHash", hash)
      onSuccess()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Admin-PIN festlegen</DialogTitle>
        <DialogDescription>
          Beim ersten Aufruf des Admin-Bereichs wird die PIN festgelegt.
          Mindestens 4 Stellen.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="setup-pin">Neue PIN</Label>
          <Input
            id="setup-pin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="setup-pin-confirm">PIN wiederholen</Label>
          <Input
            id="setup-pin-confirm"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="submit" disabled={busy}>
            {busy ? "Speichern…" : "PIN speichern"}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
