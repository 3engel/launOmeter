import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { hashPin } from "@/lib/crypto";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { clearAdminAuth } from "@/lib/admin";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface Props {
  expectedHash: string;
  onSuccess: () => void;
}

export function PinPrompt({ expectedHash, onSuccess }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const hash = await hashPin(pin);
      if (hash === expectedHash) {
        onSuccess();
      } else {
        setError("Falsche PIN.");
        setPin("");
      }
    } finally {
      setBusy(false);
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
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="pin">PIN</Label>
              <div className="flex justify-center">
                <InputOTP
                  id="pin"
                  maxLength={6}
                  minLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={pin}
                  pushPasswordManagerStrategy="none"
                  onChange={setPin}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      mask
                      className="w-12 h-16"
                    />
                    <InputOTPSlot
                      index={1}
                      mask
                      className="w-12 h-16"
                    />
                    <InputOTPSlot
                      index={2}
                      mask
                      className="w-12 h-16"
                    />
                    <InputOTPSlot
                      index={3}
                      mask
                      className="w-12 h-16"
                    />
                    <InputOTPSlot
                      index={4}
                      mask
                      className="w-12 h-16"
                    />
                    <InputOTPSlot
                      index={5}
                      mask
                      className="w-12 h-16"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={busy || pin.length === 0}
            >
              Anmelden
            </Button>
            <Button
              variant="secondary"
              asChild
            >
              <Link
                to="/"
                onClick={clearAdminAuth}
              >
                <ArrowLeft />
                Zurück zur Stimmabgabe
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
