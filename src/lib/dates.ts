import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getISOWeek,
} from "date-fns"
import { de } from "date-fns/locale"

export type DayKey = string

export function getDayKey(d: Date): DayKey {
  return format(d, "yyyy-MM-dd")
}

export function getWeekRange(d: Date) {
  return {
    from: startOfWeek(d, { weekStartsOn: 1 }),
    to: endOfWeek(d, { weekStartsOn: 1 }),
  }
}

export function getMonthRange(d: Date) {
  return {
    from: startOfMonth(d),
    to: endOfMonth(d),
  }
}

export function daysInRange(from: Date, to: Date): Date[] {
  return eachDayOfInterval({ start: from, end: to })
}

export function isoWeek(d: Date): number {
  return getISOWeek(d)
}

export function formatHumanDate(d: Date): string {
  return format(d, "dd.MM.yyyy", { locale: de })
}

export function formatWeekday(d: Date): string {
  return format(d, "EE", { locale: de })
}
