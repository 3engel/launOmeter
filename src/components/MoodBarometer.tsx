import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MOOD_OPTIONS } from "@/lib/moods"
import { getVotesByDay } from "@/lib/db"
import { getDayKey } from "@/lib/dates"
import { aggregate } from "@/lib/stats"
import { cn } from "@/lib/utils"

interface Props {
  refreshKey?: number
  className?: string
}

const ZONE_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: "#ef4444", // red-500
  2: "#f97316", // orange-500
  3: "#84cc16", // lime-500
  4: "#22c55e", // green-500
}

const CX = 120
const CY = 130
const R_OUTER = 100
const R_INNER = 70

function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) }
}

function arcPath(rOuter: number, rInner: number, startDeg: number, endDeg: number) {
  const oStart = polar(rOuter, startDeg)
  const oEnd = polar(rOuter, endDeg)
  const iStart = polar(rInner, endDeg)
  const iEnd = polar(rInner, startDeg)
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iStart.x} ${iStart.y}`,
    `A ${rInner} ${rInner} 0 0 0 ${iEnd.x} ${iEnd.y}`,
    "Z",
  ].join(" ")
}

// Each mood centered in its 45° zone: 1 → 157.5°, 2 → 112.5°, 3 → 67.5°, 4 → 22.5°
function valueToAngle(v: number): number {
  return 157.5 - (v - 1) * 45
}

const ZONES: Array<{ mood: 1 | 2 | 3 | 4; start: number; end: number }> = [
  { mood: 1, start: 180, end: 135 },
  { mood: 2, start: 135, end: 90 },
  { mood: 3, start: 90, end: 45 },
  { mood: 4, start: 45, end: 0 },
]

function Gauge({ average, hasData }: { average: number; hasData: boolean }) {
  const angle = hasData ? valueToAngle(average) : 90
  const tip = polar(R_OUTER - 4, angle)
  const baseLeft = polar(6, angle - 90)
  const baseRight = polar(6, angle + 90)

  return (
    <svg viewBox="0 0 240 150" className="w-full h-auto" role="img" aria-label="Stimmungsbarometer">
      {/* Zone arcs */}
      {ZONES.map((z) => (
        <path
          key={z.mood}
          d={arcPath(R_OUTER, R_INNER, z.start, z.end)}
          fill={ZONE_COLORS[z.mood]}
          opacity={hasData ? 0.9 : 0.35}
        />
      ))}
      {/* Smiley labels at zone centers */}
      {ZONES.map((z) => {
        const labelAngle = (z.start + z.end) / 2
        const p = polar((R_OUTER + R_INNER) / 2, labelAngle)
        const m = MOOD_OPTIONS.find((o) => o.value === z.mood)!
        return (
          <text
            key={z.mood}
            x={p.x}
            y={p.y + 6}
            textAnchor="middle"
            fontSize="18"
            aria-hidden
          >
            {m.emoji}
          </text>
        )
      })}
      {/* Needle */}
      {hasData && (
        <>
          <polygon
            points={`${tip.x},${tip.y} ${baseLeft.x},${baseLeft.y} ${baseRight.x},${baseRight.y}`}
            fill="#1f2937"
          />
          <circle cx={CX} cy={CY} r={8} fill="#1f2937" />
          <circle cx={CX} cy={CY} r={3} fill="#fff" />
        </>
      )}
      {/* Average label */}
      <text
        x={CX}
        y={CY - 30}
        textAnchor="middle"
        fontSize="20"
        fontWeight="600"
        fill="#1f2937"
      >
        {hasData ? average.toFixed(2) : "—"}
      </text>
    </svg>
  )
}

export function MoodBarometer({ refreshKey = 0, className }: Props) {
  const [counts, setCounts] = useState<Record<1 | 2 | 3 | 4, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  })
  const [total, setTotal] = useState(0)
  const [average, setAverage] = useState(0)

  useEffect(() => {
    let alive = true
    async function load() {
      const votes = await getVotesByDay(getDayKey(new Date()))
      if (!alive) return
      const stats = aggregate(votes)
      const merged: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
      let sum = 0
      let total = 0
      for (const m of [1, 2, 3, 4] as const) {
        merged[m] = stats.student.counts[m] + stats.teacher.counts[m]
        sum += m * merged[m]
        total += merged[m]
      }
      setCounts(merged)
      setTotal(total)
      setAverage(total === 0 ? 0 : sum / total)
    }
    void load()
    const id = window.setInterval(load, 10_000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [refreshKey])

  return (
    <Card
      className={cn(
        "bg-white/70 backdrop-blur-sm border-white/60 shadow-lg",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Heute</CardTitle>
        <p className="text-xs text-muted-foreground">Stimmungsbarometer</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Gauge average={average} hasData={total > 0} />
        <div className="grid grid-cols-4 gap-1 text-center">
          {MOOD_OPTIONS.map((m) => (
            <div key={m.value} className="flex flex-col items-center">
              <span className="text-lg" aria-hidden>
                {m.emoji}
              </span>
              <span className="font-mono text-sm">{counts[m.value]}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-black/10 mt-1 pt-3 flex justify-between text-sm">
          <span className="text-muted-foreground">Stimmen heute</span>
          <span className="font-mono">{total}</span>
        </div>
      </CardContent>
    </Card>
  )
}
