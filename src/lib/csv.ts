import { MOOD_OPTIONS } from "./moods"
import type { AggregatedStats } from "./stats"

export interface CsvRow {
  label: string
  stats: AggregatedStats
}

const SEP = ";"

function escape(value: string): string {
  if (/[";\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function num(n: number): string {
  return n.toString().replace(".", ",")
}

function header(): string {
  const cols = ["Zeitraum", "Rolle"]
  for (const m of MOOD_OPTIONS) cols.push(`Anzahl ${m.emoji}`)
  for (const m of MOOD_OPTIONS) cols.push(`% ${m.emoji}`)
  cols.push("Gesamt")
  cols.push("Durchschnitt (1-4)")
  return cols.map(escape).join(SEP)
}

function roleRow(label: string, role: "Schüler" | "Lehrer", s: AggregatedStats["student"]): string {
  const cols = [label, role]
  for (const m of MOOD_OPTIONS) cols.push(num(s.counts[m.value]))
  for (const m of MOOD_OPTIONS) cols.push(num(Math.round(s.percent[m.value] * 10) / 10))
  cols.push(num(s.total))
  cols.push(s.total === 0 ? "" : num(Math.round(s.average * 100) / 100))
  return cols.map(escape).join(SEP)
}

export function rowsToCsv(
  rows: CsvRow[],
  summary?: { label: string; stats: AggregatedStats }
): string {
  const lines: string[] = [header()]
  for (const row of rows) {
    lines.push(roleRow(row.label, "Schüler", row.stats.student))
    lines.push(roleRow(row.label, "Lehrer", row.stats.teacher))
  }
  if (summary) {
    lines.push(roleRow(summary.label, "Schüler", summary.stats.student))
    lines.push(roleRow(summary.label, "Lehrer", summary.stats.teacher))
  }
  return lines.join("\r\n")
}

export function downloadCsv(filename: string, content: string): void {
  const BOM = "﻿"
  const blob = new Blob([BOM + content], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
