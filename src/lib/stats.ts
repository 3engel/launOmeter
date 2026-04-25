import type { Mood, Role, Vote } from "./db"

export interface RoleStats {
  counts: Record<Mood, number>
  percent: Record<Mood, number>
  total: number
  average: number
}

export interface AggregatedStats {
  student: RoleStats
  teacher: RoleStats
}

const MOODS: Mood[] = [1, 2, 3, 4]

function emptyRole(): RoleStats {
  return {
    counts: { 1: 0, 2: 0, 3: 0, 4: 0 },
    percent: { 1: 0, 2: 0, 3: 0, 4: 0 },
    total: 0,
    average: 0,
  }
}

export function aggregate(votes: Vote[]): AggregatedStats {
  const result: AggregatedStats = {
    student: emptyRole(),
    teacher: emptyRole(),
  }

  for (const vote of votes) {
    result[vote.role].counts[vote.mood] += 1
    result[vote.role].total += 1
  }

  for (const role of ["student", "teacher"] as Role[]) {
    const r = result[role]
    if (r.total === 0) continue
    let weightedSum = 0
    for (const m of MOODS) {
      r.percent[m] = (r.counts[m] / r.total) * 100
      weightedSum += m * r.counts[m]
    }
    r.average = weightedSum / r.total
  }

  return result
}

export function aggregateByDay(votes: Vote[]): Map<string, AggregatedStats> {
  const byDay = new Map<string, Vote[]>()
  for (const v of votes) {
    if (!byDay.has(v.dayKey)) byDay.set(v.dayKey, [])
    byDay.get(v.dayKey)!.push(v)
  }
  const out = new Map<string, AggregatedStats>()
  for (const [day, list] of byDay) {
    out.set(day, aggregate(list))
  }
  return out
}
