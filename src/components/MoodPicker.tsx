import { MOOD_OPTIONS } from "@/lib/moods";
import type { Mood, Role } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
          <Button
            key={m.value}
            type="button"
            onClick={() => onPick(m.value)}
            className={cn(
              "rounded-2xl border-2 p-8 flex flex-col items-center gap-4 transition-transform h-auto min-h-44 whitespace-normal text-center text-black text-base leading-snug",
              "hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              m.color,
            )}
          >
            <img
              src={m.svg}
              alt={m.label}
              className="h-20 w-20"
            />

            <span>{m.label}</span>
          </Button>
        ))}
      </div>
      <Button
        size="lg"
        onClick={onCancel}
        className="text-xl py-6 px-4 "
      >
        <ArrowLeft />
        Zurück
      </Button>
    </div>
  );
}
