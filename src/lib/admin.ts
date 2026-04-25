export const ADMIN_SESSION_FLAG = "launometer.adminAuth"

export function setAdminAuth(): void {
  sessionStorage.setItem(ADMIN_SESSION_FLAG, "1")
}

export function clearAdminAuth(): void {
  sessionStorage.removeItem(ADMIN_SESSION_FLAG)
}

export function hasAdminAuth(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_FLAG) === "1"
}
