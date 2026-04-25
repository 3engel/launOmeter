import { MOOD_OPTIONS } from "@/lib/moods";
import type { Mood, Role } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import mood1Logo from "@/assets/mood-1-nicht-gut.svg";
import mood2Logo from "@/assets/mood-2-eher-nicht-gut.svg";
import mood3Logo from "@/assets/mood-3-ziemlich-gut.svg";
import mood4Logo from "@/assets/mood-4-sehr-gut.svg";
import { ArrowLeft } from "lucide-react";

interface Props {
  role: Role;
  onPick: (mood: Mood) => void;
  onCancel: () => void;
}

export function MoodPicker({ role, onPick, onCancel }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <div className="text-center text-4xl flex flex-col gap-6">
        <h1 className="text-4xl font-semibold tracking-tight text-center">
          {role === "student" ? "Schüler / Schülerin" : "Lehrer / Lehrerin"}
          <br />
        </h1>
        <h1>Wie geht es dir heute?</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onPick(m.value)}
            className={cn(
              "rounded-2xl border-2 p-8 flex flex-col items-center gap-4 transition-transform",
              "hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              m.color,
            )}
          >
            {m.value === 1 && (
              <img
                src={mood1Logo}
                alt={m.label}
                className="h-20 w-20"
              />
            )}

            {m.value === 2 && (
              <img
                src={mood2Logo}
                alt={m.label}
                className="h-20 w-20"
              />
            )}
            {m.value === 3 && (
              <img
                src={mood3Logo}
                alt={m.label}
                className="h-20 w-20"
              />
            )}
            {m.value === 4 && (
              <img
                src={mood4Logo}
                alt={m.label}
                className="h-20 w-20"
              />
            )}
            <span className="text-xl font-medium text-center text-foreground">
              {m.label}
            </span>
          </button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="lg"
        className="text-xl"
        onClick={onCancel}
      >
        <ArrowLeft />
        Zurück
      </Button>
    </div>
  );
}
