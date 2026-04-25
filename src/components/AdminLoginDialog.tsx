import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { hashPin } from "@/lib/crypto";
import { getSettings, setSetting } from "@/lib/db";
import { setAdminAuth } from "@/lib/admin";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

type Mode = "loading" | "setup" | "prompt";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminLoginDialog({ open, onOpenChange }: Props) {
  const [mode, setMode] = useState<Mode>("loading");
  const [pinHash, setPinHash] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setMode("loading");
    let alive = true;
    (async () => {
      const s = await getSettings();
      if (!alive) return;
      setPinHash(s.pinHash);
      setMode(s.pinHash ? "prompt" : "setup");
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  function handleSuccess() {
    setAdminAuth();
    onOpenChange(false);
    navigate("/admin");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent aria-describedby="admin-login-description">
        {mode === "loading" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl"></DialogTitle>
              <DialogDescription></DialogDescription>
              <div className="text-sm text-muted-foreground py-6 text-center">
                Lade…
              </div>
            </DialogHeader>
          </>
        )}
        {mode === "setup" && <SetupForm onSuccess={handleSuccess} />}
        {mode === "prompt" && pinHash && (
          <PromptForm
            pinHash={pinHash}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PromptForm({
  pinHash,
  onSuccess,
}: {
  pinHash: string;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const hash = await hashPin(pin);
      if (hash === pinHash) {
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
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Admin-Anmeldung</DialogTitle>
        <DialogDescription>Bitte gib die Admin-PIN ein.</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={submit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-pin">PIN</Label>
          <div className="flex justify-center">
            <InputOTP
              id="login-pin"
              maxLength={6}
              minLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={pin}
              pushPasswordManagerStrategy="none"
              onChange={setPin}
              autoFocus
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
        <DialogFooter>
          <Button
            type="submit"
            className="w-full py-4"
            disabled={busy || pin.length === 0}
          >
            Anmelden
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function SetupForm({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pin.length !== 6) {
      setError("Die PIN muss genau 6 Stellen haben.");
      return;
    }
    if (pin !== confirm) {
      setError("Die PINs stimmen nicht überein.");
      return;
    }
    setBusy(true);
    try {
      const hash = await hashPin(pin);
      await setSetting("pinHash", hash);
      onSuccess();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Admin-PIN festlegen</DialogTitle>
        <DialogDescription>
          Beim ersten Aufruf des Admin-Bereichs wird die PIN festgelegt. Genau 6
          Ziffern.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={submit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="setup-pin">Neue PIN</Label>
          <div className="flex justify-center">
            <InputOTP
              id="setup-pin"
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
          <Label htmlFor="setup-pin-confirm">PIN wiederholen</Label>
          <div className="flex justify-center">
            <InputOTP
              id="setup-pin-confirm"
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
        <DialogFooter>
          <Button
            type="submit"
            className="w-full py-4"
            disabled={busy || pin.length !== 6 || confirm.length !== 6}
          >
            {busy ? "Speichern…" : "PIN speichern"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
