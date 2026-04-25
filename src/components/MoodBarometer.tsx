import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MOOD_OPTIONS } from "@/lib/moods";
import { getVotesByDay } from "@/lib/db";
import { getDayKey } from "@/lib/dates";
import { aggregate } from "@/lib/stats";
import { cn, formatNumber } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface Props {
  refreshKey?: number;
  className?: string;
}

const ZONE_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: "#ef4444", // red-500
  2: "#f97316", // orange-500
  3: "#84cc16", // lime-500
  4: "#22c55e", // green-500
};

// Thermometer geometry
const TUBE_X = 70;
const TUBE_Y = 8;
const TUBE_W = 40;
const TUBE_H = 260;
const BULB_CX = TUBE_X + TUBE_W / 2; // 90
const BULB_CY = TUBE_Y + TUBE_H + 35; // 303
const BULB_R = 38;
const VIEWBOX_HEIGHT = BULB_CY + BULB_R + 8; // 349

function Thermometer({
  average,
  hasData,
  counts,
}: {
  average: number;
  hasData: boolean;
  counts: Record<1 | 2 | 3 | 4, number>;
}) {
  const fraction = hasData ? Math.max(0, Math.min(1, (average - 1) / 3)) : 0;
  const fillTop = TUBE_Y + TUBE_H - fraction * TUBE_H;

  const moodIdx = Math.max(1, Math.min(4, Math.round(average))) as
    | 1
    | 2
    | 3
    | 4;
  const liquidColor = hasData ? ZONE_COLORS[moodIdx] : "#cbd5e1";

  // Smiley positions: each occupies a quarter, label sits at zone center
  const yForMood = (m: number) => TUBE_Y + TUBE_H - (m - 0.5) * (TUBE_H / 4);

  return (
    <svg
      viewBox={`0 0 220 ${VIEWBOX_HEIGHT}`}
      className="w-full h-auto"
      role="img"
      aria-label="Stimmungsbarometer"
    >
      <defs>
        <clipPath id="thermo-shape">
          <rect
            x={TUBE_X}
            y={TUBE_Y}
            width={TUBE_W}
            height={TUBE_H + 50}
            rx={TUBE_W / 2}
          />
          <circle
            cx={BULB_CX}
            cy={BULB_CY}
            r={BULB_R}
          />
        </clipPath>
      </defs>

      {/* Track + liquid, clipped to thermometer shape */}
      <g clipPath="url(#thermo-shape)">
        <rect
          x={TUBE_X}
          y={TUBE_Y}
          width={TUBE_W}
          height={TUBE_H + 50}
          fill="#e5e7eb"
        />
        <circle
          cx={BULB_CX}
          cy={BULB_CY}
          r={BULB_R}
          fill="#e5e7eb"
        />

        {/* Liquid column rises from the bulb to the current mood level */}
        <rect
          x={TUBE_X}
          y={fillTop}
          width={TUBE_W}
          height={TUBE_Y + TUBE_H + 50 - fillTop}
          fill={liquidColor}
          style={{
            transition: "y 0.5s ease-out, height 0.5s ease-out, fill 0.3s",
          }}
        />
        <circle
          cx={BULB_CX}
          cy={BULB_CY}
          r={BULB_R}
          fill={liquidColor}
          style={{ transition: "fill 0.3s" }}
        />

        {/* Glass highlight on the left side */}
        <rect
          x={TUBE_X + 5}
          y={TUBE_Y + 10}
          width={4}
          height={TUBE_H + 20}
          fill="white"
          opacity="0.45"
          rx={2}
        />
      </g>

      {/* Outline (tube + bulb) */}
      <rect
        x={TUBE_X}
        y={TUBE_Y}
        width={TUBE_W}
        height={TUBE_H + 50}
        rx={TUBE_W / 2}
        fill="none"
        stroke="#94a3b8"
        strokeWidth="2"
      />
      <circle
        cx={BULB_CX}
        cy={BULB_CY}
        r={BULB_R}
        fill="none"
        stroke="#94a3b8"
        strokeWidth="2"
      />

      {/* Scale ticks + smiley SVGs + count */}
      {MOOD_OPTIONS.map((opt) => {
        const y = yForMood(opt.value);
        const iconSize = 30;
        const iconX = TUBE_X + TUBE_W + 22;
        const countX = iconX + iconSize + 8;
        return (
          <g key={opt.value}>
            <line
              x1={TUBE_X + TUBE_W + 6}
              y1={y}
              x2={TUBE_X + TUBE_W + 16}
              y2={y}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <image
              href={opt.svg}
              x={iconX}
              y={y - iconSize / 2}
              width={iconSize}
              height={iconSize}
            >
              <title>{opt.label}</title>
            </image>
            <text
              x={countX}
              y={y + 6}
              fontSize="18"
              fontWeight="600"
              fill="#1f2937"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
            >
              {counts[opt.value]}
            </text>
          </g>
        );
      })}

      {/* Average value inside the bulb */}
      <text
        x={BULB_CX}
        y={BULB_CY + 6}
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill={hasData ? "white" : "#475569"}
      >
        {hasData ? formatNumber(average) : "—"}
      </text>
    </svg>
  );
}

export function MoodBarometer({ refreshKey = 0, className }: Props) {
  const [counts, setCounts] = useState<Record<1 | 2 | 3 | 4, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      const votes = await getVotesByDay(getDayKey(new Date()));
      if (!alive) return;
      const stats = aggregate(votes);
      const merged: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
      let sum = 0;
      let total = 0;
      for (const m of [1, 2, 3, 4] as const) {
        merged[m] = stats.student.counts[m] + stats.teacher.counts[m];
        sum += m * merged[m];
        total += merged[m];
      }
      setCounts(merged);
      setTotal(total);
      setAverage(total === 0 ? 0 : sum / total);
    }
    void load();
    const id = window.setInterval(load, 10_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [refreshKey]);

  return (
    <Card
      className={cn(
        "bg-transparent backdrop-blur-sm border-white/60 shadow-lg gap-0",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Heute</CardTitle>
        <CardDescription>Stimmungsbarometer</CardDescription>
      </CardHeader>
      <CardContent>
        <Thermometer
          average={average}
          hasData={total > 0}
          counts={counts}
        />
      </CardContent>
      <CardFooter className="bg-transparent border-0 grid grid-cols-2 text-base">
        <span className="text-muted-foreground">Anzahl Stimmen</span>
        <span className="flex justify-end">
          <Badge variant="default" className="text-base px-3 py-3">{total}</Badge>
        </span>
      </CardFooter>
    </Card>
  );
}
