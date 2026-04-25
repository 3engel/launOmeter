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
import { cn } from "@/lib/utils";

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
  className,
}: {
  rowLabel: string;
  roleLabel: string;
  s: RoleStats;
  className?: string;
}) {
  return (
    <TableRow className={cn(className)}>
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
              <img
                src={m.svg}
                alt={m.label}
                className="size-14 mx-auto"
              />
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
                className="border-t-4"
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
