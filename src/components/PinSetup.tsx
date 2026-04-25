import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { hashPin } from "@/lib/crypto"
import { setSetting } from "@/lib/db"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"

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
    if (pin.length !== 6) {
      setError("Die PIN muss genau 6 Stellen haben.")
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
            Genau 6 Ziffern.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pin">Neue PIN</Label>
              <div className="flex justify-center">
                <InputOTP
                  id="pin"
                  maxLength={6}
                  minLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={pin}
                  onChange={setPin}
                  pushPasswordManagerStrategy="none"
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} mask className="w-12 h-16" />
                    <InputOTPSlot index={1} mask className="w-12 h-16" />
                    <InputOTPSlot index={2} mask className="w-12 h-16" />
                    <InputOTPSlot index={3} mask className="w-12 h-16" />
                    <InputOTPSlot index={4} mask className="w-12 h-16" />
                    <InputOTPSlot index={5} mask className="w-12 h-16" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm">PIN wiederholen</Label>
              <div className="flex justify-center">
                <InputOTP
                  id="confirm"
                  maxLength={6}
                  minLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={confirm}
                  onChange={setConfirm}
                  pushPasswordManagerStrategy="none"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} mask className="w-12 h-16" />
                    <InputOTPSlot index={1} mask className="w-12 h-16" />
                    <InputOTPSlot index={2} mask className="w-12 h-16" />
                    <InputOTPSlot index={3} mask className="w-12 h-16" />
                    <InputOTPSlot index={4} mask className="w-12 h-16" />
                    <InputOTPSlot index={5} mask className="w-12 h-16" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={busy || pin.length !== 6 || confirm.length !== 6}
            >
              {busy ? "Speichern..." : "PIN speichern"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
