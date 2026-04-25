import type { Mood } from "./db"

export interface MoodOption {
  value: Mood
  emoji: string
  label: string
  color: string

}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 1,
    emoji: "😞",
    label: "Es geht mir nicht gut.",
    color: "bg-red-100 hover:bg-red-200 border-red-300",
  },
  {
    value: 2,
    emoji: "🙁",
    label: "Es geht mir eher nicht gut.",
    color: "bg-orange-100 hover:bg-orange-200 border-orange-300",
  },
  {
    value: 3,
    emoji: "🙂",
    label: "Es geht mir ziemlich gut.",
    color: "bg-lime-100 hover:bg-lime-200 border-lime-300",
  },
  {
    value: 4,
    emoji: "😀",
    label: "Es geht mir sehr gut.",
    color: "bg-green-100 hover:bg-green-200 border-green-300",
  },
]
