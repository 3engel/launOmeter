import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleSelector } from "@/components/RoleSelector";
import { MoodPicker } from "@/components/MoodPicker";
import { LockScreen } from "@/components/LockScreen";
import { QuotaFullScreen } from "@/components/QuotaFullScreen";
import { SchoolBackground } from "@/components/SchoolBackground";
import { MoodBarometer } from "@/components/MoodBarometer";
import { AdminLoginDialog } from "@/components/AdminLoginDialog";
import {
  addVote,
  getDailyCounts,
  getSettings,
  type Mood,
  type Role,
} from "@/lib/db";
import { getDayKey } from "@/lib/dates";
import { getRemainingLockMs, setLock } from "@/lib/lock";
import { hasAdminAuth } from "@/lib/admin";
import { Settings } from "lucide-react";

type View = "loading" | "role" | "mood" | "lock" | "full";

export function HomePage() {
  const [view, setView] = useState<View>("loading");
  const [role, setRole] = useState<Role | null>(null);
  const [studentDisabled, setStudentDisabled] = useState(false);
  const [teacherDisabled, setTeacherDisabled] = useState(false);
  const [voteTick, setVoteTick] = useState(0);
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();

  const handleAdminClick = () => {
    if (hasAdminAuth()) {
      navigate("/admin");
    } else {
      setAdminOpen(true);
    }
  };

  const refresh = useCallback(async () => {
    if (getRemainingLockMs() > 0) {
      setView("lock");
      return;
    }
    const [settings, counts] = await Promise.all([
      getSettings(),
      getDailyCounts(getDayKey(new Date())),
    ]);
    const sFull = counts.student >= settings.maxStudents;
    const tFull = counts.teacher >= settings.maxTeachers;
    setStudentDisabled(sFull);
    setTeacherDisabled(tFull);
    if (sFull && tFull) {
      setView("full");
      return;
    }
    setView("role");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // React to date change at midnight while page is open
  useEffect(() => {
    let lastKey = getDayKey(new Date());
    const id = window.setInterval(() => {
      const k = getDayKey(new Date());
      if (k !== lastKey) {
        lastKey = k;
        void refresh();
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const handleSelectRole = (r: Role) => {
    setRole(r);
    setView("mood");
  };

  const handlePickMood = async (mood: Mood) => {
    if (!role) return;
    await addVote(role, mood);
    const settings = await getSettings();
    setLock(settings.lockSeconds * 1000);
    setVoteTick((n) => n + 1);
    setRole(null);
    setView("lock");
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
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

        <div className="absolute top-0 right-0 px-6 py-4">
          <button
            type="button"
            onClick={handleAdminClick}
            title="Zur Administration"
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Settings />
          </button>
        </div>
      </header>
      <AdminLoginDialog
        open={adminOpen}
        onOpenChange={setAdminOpen}
      />

      <main className="relative flex-1 flex items-stretch pb-40">
        <div
          className="hidden lg:block w-80 shrink-0"
          aria-hidden
        />
        <div className="flex-1 flex items-center justify-center">
          {view === "loading" && (
            <div className="text-muted-foreground">Lade…</div>
          )}
          {view === "role" && (
            <RoleSelector
              studentDisabled={studentDisabled}
              teacherDisabled={teacherDisabled}
              onSelect={handleSelectRole}
            />
          )}
          {view === "mood" && role && (
            <MoodPicker
              role={role}
              onPick={handlePickMood}
              onCancel={() => {
                setRole(null);
                setView("role");
              }}
            />
          )}
          {view === "lock" && <LockScreen onDone={() => void refresh()} />}
          {view === "full" && <QuotaFullScreen />}
        </div>
        <aside className="hidden lg:flex w-80 shrink-0 p-6 items-start justify-center">
          <MoodBarometer
            refreshKey={voteTick}
            className="w-full"
          />
        </aside>
      </main>
      <footer>
        <div className="text-right text-sm text-muted-foreground py-4 px-4">
          <p>
            Entwickelt von Familie Engel. Quellcode auf{" "}
            <a
              href="https://github.com/3engel/launOmeter"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
