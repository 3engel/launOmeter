import { Link } from "react-router-dom"
import {
  BarChart3,
  Settings as SettingsIcon,
  ShieldAlert,
  LogOut,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type AdminSection = "stats" | "settings" | "danger"

interface NavItem {
  key: AdminSection
  label: string
  icon: typeof BarChart3
}

const ITEMS: NavItem[] = [
  { key: "stats", label: "Statistik", icon: BarChart3 },
  { key: "settings", label: "Einstellungen", icon: SettingsIcon },
  { key: "danger", label: "Gefahrenzone", icon: ShieldAlert },
]

interface Props {
  active: AdminSection
  onChange: (section: AdminSection) => void
  onLogout: () => void
  onLeave: () => void
}

export function AdminSidebar({ active, onChange, onLogout, onLeave }: Props) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card">
      <div className="px-5 py-5 border-b flex items-center gap-3">
        <img src="/logo-mark.svg" alt="" className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <div className="text-lg font-extrabold tracking-tight leading-tight">
            Laun<span className="text-[#3fb78a]">O</span>Meter
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Administration
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="p-3 border-t flex flex-col gap-1">
        <Link
          to="/"
          onClick={onLeave}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Zur Stimmabgabe</span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Abmelden</span>
        </button>
      </div>
    </aside>
  )
}

interface MobileBarProps {
  active: AdminSection
  onChange: (section: AdminSection) => void
}

export function AdminMobileBar({ active, onChange }: MobileBarProps) {
  return (
    <div className="md:hidden border-b bg-card overflow-x-auto">
      <div className="flex gap-1 p-2 min-w-max">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/60"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
