import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/db";

interface Props {
  studentDisabled: boolean;
  teacherDisabled: boolean;
  onSelect: (role: Role) => void;
}

export function RoleSelector({
  studentDisabled,
  teacherDisabled,
  onSelect,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h1 className="text-4xl font-semibold tracking-tight">
        Wie geht es dir heute?
      </h1>
      <p className="text-xl font-semibold text-muted-foreground">
        Wähle bitte zuerst aus, wer du bist.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <RoleCard
          emoji="🎒"
          title="Schüler / Schülerin"
          disabled={studentDisabled}
          onClick={() => onSelect("student")}
        />
        <RoleCard
          emoji="👩‍🏫"
          title="Lehrer / Lehrerin"
          disabled={teacherDisabled}
          onClick={() => onSelect("teacher")}
        />
      </div>
    </div>
  );
}

interface RoleCardProps {
  emoji: string;
  title: string;
  disabled: boolean;
  onClick: () => void;
}

function RoleCard({ emoji, title, disabled, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl",
        "transition-transform",
        !disabled && "hover:scale-[1.02] active:scale-[0.99]",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
          <span
            className="text-7xl"
            aria-hidden
          >
            {emoji}
          </span>
          <span className="text-2xl font-medium">{title}</span>
          {disabled && (
            <span className="text-sm text-muted-foreground">
              Heute haben bereits alle abgestimmt.
            </span>
          )}
        </CardContent>
      </Card>
    </button>
  );
}
