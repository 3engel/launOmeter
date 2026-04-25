import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOOD_OPTIONS } from "@/lib/moods";
import type { AggregatedStats, RoleStats } from "@/lib/stats";
import mood1Logo from "@/assets/mood-1-nicht-gut.svg";
import mood2Logo from "@/assets/mood-2-eher-nicht-gut.svg";
import mood3Logo from "@/assets/mood-3-ziemlich-gut.svg";
import mood4Logo from "@/assets/mood-4-sehr-gut.svg";

export interface StatsRow {
  label: string;
  stats: AggregatedStats;
}

interface Props {
  rows: StatsRow[];
  showSummary?: boolean;
  summary?: AggregatedStats;
  summaryLabel?: string;
}

const ROLES: Array<{ key: "student" | "teacher"; label: string }> = [
  { key: "student", label: "Schüler" },
  { key: "teacher", label: "Lehrer" },
];

function formatPercent(p: number): string {
  return p === 0 ? "—" : `${p.toFixed(0)}%`;
}

function formatAvg(avg: number, total: number): string {
  return total === 0 ? "—" : avg.toFixed(2);
}

function RoleRow({
  rowLabel,
  roleLabel,
  s,
}: {
  rowLabel: string;
  roleLabel: string;
  s: RoleStats;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{rowLabel}</TableCell>
      <TableCell>{roleLabel}</TableCell>
      {MOOD_OPTIONS.map((m) => (
        <TableCell
          key={m.value}
          className="text-center"
        >
          <div className="font-mono">{s.counts[m.value]}</div>
          <div className="text-xs text-muted-foreground">
            {formatPercent(s.percent[m.value])}
          </div>
        </TableCell>
      ))}
      <TableCell className="text-center font-mono">{s.total}</TableCell>
      <TableCell className="text-center font-mono">
        {formatAvg(s.average, s.total)}
      </TableCell>
    </TableRow>
  );
}

export function StatsTable({
  rows,
  showSummary = false,
  summary,
  summaryLabel = "Summe",
}: Props) {
  const hasData = rows.some(
    (r) => r.stats.student.total > 0 || r.stats.teacher.total > 0,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Zeitraum</TableHead>
          <TableHead>Rolle</TableHead>
          {MOOD_OPTIONS.map((m) => (
            <TableHead
              key={m.value}
              className="text-center"
            >
              {m.value === 1 && (
                <img
                  src={mood1Logo}
                  alt={m.label}
                  className="size-14"
                />
              )}

              {m.value === 2 && (
                <img
                  src={mood2Logo}
                  alt={m.label}
                  className="size-14"
                />
              )}
              {m.value === 3 && (
                <img
                  src={mood3Logo}
                  alt={m.label}
                  className="size-14"
                />
              )}
              {m.value === 4 && (
                <img
                  src={mood4Logo}
                  alt={m.label}
                  className="size-14"
                />
              )}
            </TableHead>
          ))}
          <TableHead className="text-center">Gesamt</TableHead>
          <TableHead className="text-center">Ø (1–4)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!hasData && (
          <TableRow>
            <TableCell
              colSpan={2 + MOOD_OPTIONS.length + 2}
              className="text-center text-muted-foreground py-6"
            >
              Keine Daten im gewählten Zeitraum.
            </TableCell>
          </TableRow>
        )}
        {rows.map((row) =>
          ROLES.map((r) => (
            <RoleRow
              key={`${row.label}-${r.key}`}
              rowLabel={row.label}
              roleLabel={r.label}
              s={row.stats[r.key]}
            />
          )),
        )}
        {showSummary && summary && (
          <>
            {ROLES.map((r) => (
              <RoleRow
                key={`summary-${r.key}`}
                rowLabel={summaryLabel}
                roleLabel={r.label}
                s={summary[r.key]}
              />
            ))}
          </>
        )}
      </TableBody>
    </Table>
  );
}
