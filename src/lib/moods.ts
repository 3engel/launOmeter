import type { Mood } from "./db"

export interface MoodOption {
  value: Mood
  emoji: string
  label: string
  color: string
  svg: string
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 1,
    emoji: "😞",
    label: "Es geht mir nicht gut.",
    color: "bg-chart-1/50 hover:bg-chart-1/70 border-chart-1/70",
    svg: "/mood-1-nicht-gut.svg"
  },
  {
    value: 2,
    emoji: "🙁",
    label: "Es geht mir eher nicht gut.",
    color: "bg-chart-2/50 hover:bg-chart-2/70 border-chart-2/70",
    svg: "/mood-2-eher-nicht-gut.svg"
  },
  {
    value: 3,
    emoji: "🙂",
    label: "Es geht mir ziemlich gut.",
    color: "bg-chart-3/50 hover:bg-chart-3/70 border-chart-3/70",
    svg: "/mood-3-ziemlich-gut.svg"
  },
  {
    value: 4,
    emoji: "😀",
    label: "Es geht mir sehr gut.",
    color: "bg-chart-4/50 hover:bg-chart-4/70 border-chart-4/70",
    svg: "/mood-4-sehr-gut.svg"
  },
]
