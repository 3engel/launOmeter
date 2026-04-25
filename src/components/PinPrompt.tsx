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

interface Props {
  expectedHash: string
  onSuccess: () => void
}

export function PinPrompt({ expectedHash, onSuccess }: Props) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const hash = await hashPin(pin)
      if (hash === expectedHash) {
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
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin-Bereich</CardTitle>
          <CardDescription>Bitte gib die Admin-PIN ein.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy || pin.length === 0}>
              Anmelden
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
