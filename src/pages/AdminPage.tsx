import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PinSetup } from "@/components/PinSetup";
import { PinPrompt } from "@/components/PinPrompt";
import { StatsTable, type StatsRow } from "@/components/StatsTable";
import { AdminSidebar, type AdminSection } from "@/components/AdminSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  deleteAllVotes,
  deleteVotesByDay,
  getSettings,
  getVotesByDay,
  getVotesInRange,
  setSetting,
  type Settings,
} from "@/lib/db";
import {
  daysInRange,
  formatHumanDate,
  formatWeekday,
  getDayKey,
  getMonthRange,
  getWeekRange,
  isoWeek,
} from "@/lib/dates";
import { aggregate } from "@/lib/stats";
import { hashPin } from "@/lib/crypto";
import { downloadCsv, rowsToCsv } from "@/lib/csv";
import { clearAdminAuth, hasAdminAuth, setAdminAuth } from "@/lib/admin";
import { format } from "date-fns";
import { SchoolBackground } from "@/components/SchoolBackground";

type AuthState = "loading" | "setup" | "prompt" | "authed";

export function AdminPage() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [settings, setSettings] = useState<Settings | null>(null);
  const navigate = useNavigate();

  const loadSettings = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
    return s;
  }, []);

  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      if (!s.pinHash) {
        setAuth("setup");
      } else if (hasAdminAuth()) {
        setAuth("authed");
      } else {
        setAuth("prompt");
      }
    })();
  }, [loadSettings]);

  if (auth === "loading" || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Lade…
      </div>
    );
  }

  if (auth === "setup") {
    return (
      <AuthShell>
        <PinSetup
          onDone={async () => {
            setAdminAuth();
            await loadSettings();
            setAuth("authed");
          }}
        />
      </AuthShell>
    );
  }

  if (auth === "prompt") {
    return (
      <AuthShell>
        <PinPrompt
          expectedHash={settings.pinHash!}
          onSuccess={() => {
            setAdminAuth();
            setAuth("authed");
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AdminDashboard
      settings={settings}
      onSettingsChange={async () => {
        await loadSettings();
      }}
      onLogout={() => {
        clearAdminAuth();
        navigate("/");
      }}
    />
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SchoolBackground />
      <header className="flex items-center justify-center gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="logo-mark.svg"
            alt=""
            className="h-12 w-12"
          />
          <span className="text-4xl font-extrabold tracking-tight">
            Laun<span className="text-[#3fb78a]">O</span>Meter
          </span>
        </div>
      </header>
      <main className="flex-1 mt-30">{children}</main>
    </div>
  );
}

function AdminDashboard({
  settings,
  onSettingsChange,
  onLogout,
}: {
  settings: Settings;
  onSettingsChange: () => Promise<void>;
  onLogout: () => void;
}) {
  const [section, setSection] = useState<AdminSection>("stats");

  const handleLeave = () => clearAdminAuth();

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AdminSidebar
          active={section}
          onChange={setSection}
          onLogout={onLogout}
          onLeave={handleLeave}
        />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-accent">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-1 h-4 my-auto"
            />
            <h1 className="text-base font-semibold">
              {SECTION_TITLES[section]}
            </h1>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto w-full">
              {section === "stats" && <StatsSection />}
              {section === "settings" && (
                <SettingsCard
                  settings={settings}
                  onChange={onSettingsChange}
                />
              )}
              {section === "info" && <InfoSection />}
              {section === "danger" && <DangerZone />}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

const SECTION_TITLES: Record<AdminSection, string> = {
  stats: "Statistik",
  settings: "Einstellungen",
  info: "Anleitung",
  danger: "Gefahrenzone",
};

function SettingsCard({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: () => Promise<void>;
}) {
  const [students, setStudents] = useState(String(settings.maxStudents));
  const [teachers, setTeachers] = useState(String(settings.maxTeachers));
  const [lockSec, setLockSec] = useState(String(settings.lockSeconds));
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  async function save() {
    const s = Math.max(0, Math.floor(Number(students) || 0));
    const t = Math.max(0, Math.floor(Number(teachers) || 0));
    const l = Math.max(0, Math.floor(Number(lockSec) || 0));
    await setSetting("maxStudents", s);
    await setSetting("maxTeachers", t);
    await setSetting("lockSeconds", l);
    setStudents(String(s));
    setTeachers(String(t));
    setLockSec(String(l));
    setSavedAt(Date.now());
    await onChange();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Maximale Anzahl an Stimmen pro Tag.</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxStudents">Max. Schüler pro Tag</Label>
              <Input
                id="maxStudents"
                type="number"
                min={0}
                value={students}
                onChange={(e) => setStudents(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxTeachers">Max. Lehrer pro Tag</Label>
              <Input
                id="maxTeachers"
                type="number"
                min={0}
                value={teachers}
                onChange={(e) => setTeachers(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lockSeconds">Sperre nach Stimme (Sekunden)</Label>
              <Input
                id="lockSeconds"
                type="number"
                min={0}
                value={lockSec}
                onChange={(e) => setLockSec(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={save}>Speichern</Button>
          {savedAt && (
            <span className="text-sm text-muted-foreground ml-4">
              Gespeichert um {format(savedAt, "HH:mm:ss")}
            </span>
          )}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>PIN ändern</CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Hier kannst du die Admin-PIN ändern. Diese wird benötigt, um auf
            diese Seite zuzugreifen und die Einstellungen zu ändern. Wähle eine
            sichere PIN, um unbefugten Zugriff zu verhindern.
          </p>
        </CardContent>
        <CardFooter>
          <Dialog
            open={pinDialogOpen}
            onOpenChange={setPinDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>PIN ändern</Button>
            </DialogTrigger>
            <DialogContent>
              <ChangePinForm onClose={() => setPinDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

function ChangePinForm({ onClose }: { onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const hash = await hashPin(pin);
      await setSetting("pinHash", hash);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>PIN ändern</DialogTitle>
        <DialogDescription>
          Lege eine neue Admin-PIN fest. Genau 6 Ziffern.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={submit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="newpin">Neue PIN</Label>
          <div className="flex justify-center">
            <InputOTP
              id="newpin"
              maxLength={6}
              minLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={pin}
              onChange={setPin}
              pushPasswordManagerStrategy="none"
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="newpin2">PIN wiederholen</Label>
          <div className="flex justify-center">
            <InputOTP
              id="newpin2"
              maxLength={6}
              minLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={confirm}
              onChange={setConfirm}
              pushPasswordManagerStrategy="none"
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
        {pin !== confirm && confirm.length === 6 && (
          <p className="text-sm text-destructive">
            Die PINs stimmen nicht überein.
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            disabled={busy || pin !== confirm}
          >
            Speichern
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function StatsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Stimmen je Smiley und Rolle, mit Prozentanteil und Durchschnitt.
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="day">
          <TabsList>
            <TabsTrigger value="day">Tag</TabsTrigger>
            <TabsTrigger value="week">Woche</TabsTrigger>
            <TabsTrigger value="month">Monat</TabsTrigger>
          </TabsList>
          <TabsContent value="day">
            <DayStats />
          </TabsContent>
          <TabsContent value="week">
            <WeekStats />
          </TabsContent>
          <TabsContent value="month">
            <MonthStats />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DayStats() {
  const today = getDayKey(new Date());
  const [day, setDay] = useState<string>(today);
  const [rows, setRows] = useState<StatsRow[]>([]);
  const [reload, setReload] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const total =
    (rows[0]?.stats.student.total ?? 0) + (rows[0]?.stats.teacher.total ?? 0);

  useEffect(() => {
    (async () => {
      const votes = await getVotesByDay(day);
      setRows([
        { label: formatHumanDate(new Date(day)), stats: aggregate(votes) },
      ]);
    })();
  }, [day, reload]);

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteVotesByDay(day);
      setConfirmOpen(false);
      setReload((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }

  function handleExport() {
    if (!rows[0]) return;
    const csv = rowsToCsv(rows);
    downloadCsv(`launometer-tag-${day}.csv`, csv);
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Label htmlFor="day-input">Tag</Label>
        <Input
          id="day-input"
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-fit"
        />
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={total === 0}
          className="ml-auto"
        >
          CSV exportieren
        </Button>
        <Dialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={total === 0}
            >
              Tag zurücksetzen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Stimmen für {formatHumanDate(new Date(day))} löschen?
              </DialogTitle>
              <DialogDescription>
                Es werden {total} Stimme(n) endgültig gelöscht. Diese Aktion
                kann nicht rückgängig gemacht werden.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={busy}
              >
                {busy ? "Lösche…" : "Endgültig löschen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <StatsTable rows={rows} />
    </div>
  );
}

function InfoSection() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Was ist LaunOmeter?</CardTitle>
          <CardDescription>
            LaunOmeter ist eine Webanwendung zur anonymen Erfassung der
            Stimmungslage in einer Schulklasse oder Gruppe. Schüler:innen und
            Lehrkräfte geben mit einem Klick ihre aktuelle Stimmung ab. Alle
            Daten werden ausschließlich lokal im Browser gespeichert – es
            werden keine Daten an Server oder Dritte übertragen.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stimmabgabe</CardTitle>
          <CardDescription>
            So gibst du eine Stimme ab.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Auf der Startseite die <strong>Rolle</strong> wählen –
              Schüler:in oder Lehrkraft.
            </li>
            <li>
              Eine der vier <strong>Stimmungen</strong> auswählen: „nicht gut“,
              „eher nicht gut“, „ziemlich gut“ oder „sehr gut“.
            </li>
            <li>
              Nach der Abgabe wird das Gerät kurz <strong>gesperrt</strong>,
              damit nicht versehentlich mehrfach abgestimmt wird. Die Sperrzeit
              ist in den Einstellungen konfigurierbar.
            </li>
            <li>
              Sobald das Tageslimit für eine Rolle erreicht ist, kann diese
              Rolle nicht mehr abstimmen. Sind beide Limits erreicht, erscheint
              eine entsprechende Meldung.
            </li>
          </ol>
          <p className="text-muted-foreground">
            Das <strong>Stimmungsbarometer</strong> rechts auf der Startseite
            zeigt fortlaufend die aggregierte Stimmung des laufenden Tages an.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adminbereich öffnen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Den Adminbereich erreichst du über das <strong>Zahnrad-Symbol</strong>{" "}
              oben rechts auf der Startseite.
            </li>
            <li>
              Beim ersten Aufruf wird eine <strong>6-stellige PIN</strong>{" "}
              festgelegt. Diese PIN schützt anschließend den Zugang.
            </li>
            <li>
              Über <strong>Abmelden</strong> wird die Sitzung beendet, beim
              nächsten Aufruf ist die PIN erneut erforderlich.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bereich „Statistik“</CardTitle>
          <CardDescription>
            Auswertung der abgegebenen Stimmen.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Drei Ansichten als Reiter: <strong>Tag</strong>,{" "}
              <strong>Woche</strong> und <strong>Monat</strong>.
            </li>
            <li>
              Für jede Rolle werden die Stimmen je Smiley sowie Anteile in
              Prozent und ein Durchschnittswert angezeigt.
            </li>
            <li>
              Mit <strong>CSV exportieren</strong> kann der aktuelle Datensatz
              heruntergeladen und in einer Tabellenkalkulation weiterverarbeitet
              werden.
            </li>
            <li>
              In der Tagesansicht kann ein einzelner Tag mit{" "}
              <strong>Tag zurücksetzen</strong> gelöscht werden. Diese Aktion
              ist nicht umkehrbar.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bereich „Einstellungen“</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Max. Schüler pro Tag</strong> und{" "}
              <strong>Max. Lehrer pro Tag</strong> begrenzen die Anzahl der
              Stimmen je Rolle innerhalb eines Tages. Wert 0 deaktiviert die
              jeweilige Rolle.
            </li>
            <li>
              <strong>Sperre nach Stimme (Sekunden)</strong> legt fest, wie
              lange das Gerät nach jeder Stimmabgabe gesperrt bleibt.
            </li>
            <li>
              Über <strong>PIN ändern</strong> kann die Admin-PIN jederzeit
              neu gesetzt werden.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bereich „Gefahrenzone“</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p>
            Hier können <strong>alle</strong> bisher abgegebenen Stimmen
            unwiderruflich gelöscht werden. Einstellungen und PIN bleiben
            erhalten. Zur Bestätigung muss das Wort <strong>LÖSCHEN</strong>{" "}
            eingegeben werden.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datenschutz &amp; Speicherung</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Alle Stimmen, Einstellungen und die PIN werden ausschließlich{" "}
              <strong>lokal im Browser</strong> (IndexedDB) gespeichert.
            </li>
            <li>
              Es findet <strong>keine Datenübertragung</strong> an Server oder
              Dritte statt.
            </li>
            <li>
              Wird der Browser-Speicher gelöscht oder ein anderes Gerät
              verwendet, sind die Daten dort nicht verfügbar.
            </li>
            <li>
              Die Stimmen werden anonym erfasst – es werden keine Namen oder
              persönlichen Informationen gespeichert.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipps für den Schulalltag</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Die App eignet sich gut für ein <strong>festes Tablet</strong>{" "}
              im Klassenraum, an dem Schüler:innen am Tagesbeginn oder -ende
              kurz abstimmen.
            </li>
            <li>
              Über die <strong>Vollbild-Schaltfläche</strong> oben rechts auf
              der Startseite lässt sich der Kioskmodus aktivieren.
            </li>
            <li>
              Die Tageslimits sollten ungefähr zur Klassen- bzw.
              Kollegiumsgröße passen, damit niemand „leer ausgeht“ und
              Mehrfachabgaben begrenzt bleiben.
            </li>
            <li>
              Für eine längere Auswertung empfiehlt sich der regelmäßige{" "}
              <strong>CSV-Export</strong>, da die Daten nur lokal vorliegen.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function DangerZone() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneAt, setDoneAt] = useState<number | null>(null);

  async function handleReset() {
    setBusy(true);
    try {
      await deleteAllVotes();
      setConfirmOpen(false);
      setConfirmText("");
      setDoneAt(Date.now());
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Gefahrenzone</CardTitle>
        <CardDescription>
          Setzt alle bisher abgegebenen Stimmen unwiderruflich zurück.
          Einstellungen und PIN bleiben erhalten.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3 flex-wrap">
        <Dialog
          open={confirmOpen}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) setConfirmText("");
          }}
        >
          <DialogTrigger asChild>
            <Button variant="destructive">Alle Stimmen zurücksetzen</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wirklich alle Stimmen löschen?</DialogTitle>
              <DialogDescription>
                Tippe <strong>LÖSCHEN</strong> ein, um zu bestätigen. Diese
                Aktion kann nicht rückgängig gemacht werden.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="LÖSCHEN"
              autoFocus
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={busy || confirmText !== "LÖSCHEN"}
              >
                {busy ? "Lösche…" : "Endgültig löschen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {doneAt && (
          <span className="text-sm text-muted-foreground">
            Zurückgesetzt um {format(doneAt, "HH:mm:ss")}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

function WeekStats() {
  const today = new Date();
  const [anchor, setAnchor] = useState<string>(getDayKey(today));
  const [rows, setRows] = useState<StatsRow[]>([]);
  const [summary, setSummary] = useState<StatsRow["stats"] | null>(null);
  const [weekLabel, setWeekLabel] = useState<string>("");

  useEffect(() => {
    (async () => {
      const d = new Date(anchor);
      const { from, to } = getWeekRange(d);
      const days = daysInRange(from, to);
      const votes = await getVotesInRange(from, to);
      const byDay = new Map<string, typeof votes>();
      for (const v of votes) {
        if (!byDay.has(v.dayKey)) byDay.set(v.dayKey, []);
        byDay.get(v.dayKey)!.push(v);
      }
      const newRows: StatsRow[] = days.map((dd) => {
        const k = getDayKey(dd);
        return {
          label: `${formatWeekday(dd)} ${formatHumanDate(dd)}`,
          stats: aggregate(byDay.get(k) ?? []),
        };
      });
      setRows(newRows);
      setSummary(aggregate(votes));
      setWeekLabel(
        `KW ${isoWeek(d)} (${formatHumanDate(from)} – ${formatHumanDate(to)})`,
      );
    })();
  }, [anchor]);

  function handleExport() {
    if (!summary) return;
    const csv = rowsToCsv(rows, { label: "Wochensumme", stats: summary });
    const d = new Date(anchor);
    const { from } = getWeekRange(d);
    downloadCsv(`launometer-woche-KW${isoWeek(d)}-${getDayKey(from)}.csv`, csv);
  }

  const hasData = rows.some(
    (r) => r.stats.student.total + r.stats.teacher.total > 0,
  );

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Label htmlFor="week-input">Datum in der Woche</Label>
        <Input
          id="week-input"
          type="date"
          value={anchor}
          onChange={(e) => setAnchor(e.target.value)}
          className="w-fit"
        />
        <span className="text-sm text-muted-foreground">{weekLabel}</span>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!hasData}
          className="ml-auto"
        >
          CSV exportieren
        </Button>
      </div>
      <StatsTable
        rows={rows}
        showSummary={!!summary}
        summary={summary ?? undefined}
        summaryLabel="Wochensumme"
      />
    </div>
  );
}

function MonthStats() {
  const today = new Date();
  const [anchor, setAnchor] = useState<string>(format(today, "yyyy-MM"));
  const [rows, setRows] = useState<StatsRow[]>([]);
  const [summary, setSummary] = useState<StatsRow["stats"] | null>(null);

  useEffect(() => {
    (async () => {
      const d = new Date(`${anchor}-01`);
      const { from, to } = getMonthRange(d);
      const days = daysInRange(from, to);
      const votes = await getVotesInRange(from, to);
      const byDay = new Map<string, typeof votes>();
      for (const v of votes) {
        if (!byDay.has(v.dayKey)) byDay.set(v.dayKey, []);
        byDay.get(v.dayKey)!.push(v);
      }
      const newRows: StatsRow[] = days.map((dd) => ({
        label: formatHumanDate(dd),
        stats: aggregate(byDay.get(getDayKey(dd)) ?? []),
      }));
      setRows(newRows);
      setSummary(aggregate(votes));
    })();
  }, [anchor]);

  function handleExport() {
    if (!summary) return;
    const csv = rowsToCsv(rows, { label: "Monatssumme", stats: summary });
    downloadCsv(`launometer-monat-${anchor}.csv`, csv);
  }

  const hasData = rows.some(
    (r) => r.stats.student.total + r.stats.teacher.total > 0,
  );

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Label htmlFor="month-input">Monat</Label>
        <Input
          id="month-input"
          type="month"
          value={anchor}
          onChange={(e) => setAnchor(e.target.value)}
          className="w-fit"
        />
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!hasData}
          className="ml-auto"
        >
          CSV exportieren
        </Button>
      </div>
      <StatsTable
        rows={rows}
        showSummary={!!summary}
        summary={summary ?? undefined}
        summaryLabel="Monatssumme"
      />
    </div>
  );
}
