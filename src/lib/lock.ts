const KEY = "launometer.lockedUntil"
const DURATION_MS = 7_000

export function setLock(durationMs: number = DURATION_MS): number {
  const until = Date.now() + durationMs
  localStorage.setItem(KEY, String(until))
  return until
}

export function getLockUntil(): number {
  const raw = localStorage.getItem(KEY)
  if (!raw) return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function getRemainingLockMs(): number {
  return Math.max(0, getLockUntil() - Date.now())
}

export function clearLock(): void {
  localStorage.removeItem(KEY)
}
