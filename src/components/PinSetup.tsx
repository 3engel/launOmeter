import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { hashPin } from "@/lib/crypto"
import { setSetting } from "@/lib/db"

interface Props {
  onDone: () => void
}

export function PinSetup({ onDone }: Props) {
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
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
      onDone()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin-PIN festlegen</CardTitle>
          <CardDescription>
            Beim ersten Aufruf des Admin-Bereichs musst du eine PIN festlegen.
            Mindestens 4 Stellen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pin">Neue PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm">PIN wiederholen</Label>
              <Input
                id="confirm"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy}>
              {busy ? "Speichern..." : "PIN speichern"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
