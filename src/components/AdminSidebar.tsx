import { Link } from "react-router-dom";
import {
  BarChart3,
  Settings as SettingsIcon,
  ShieldAlert,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export type AdminSection = "stats" | "settings" | "danger";

interface NavItem {
  key: AdminSection;
  label: string;
  icon: typeof BarChart3;
}

const ITEMS: NavItem[] = [
  { key: "stats", label: "Statistik", icon: BarChart3 },
  { key: "settings", label: "Einstellungen", icon: SettingsIcon },
  { key: "danger", label: "Gefahrenzone", icon: ShieldAlert },
];

interface Props extends Omit<React.ComponentProps<typeof Sidebar>, "onChange"> {
  active: AdminSection;
  onChange: (section: AdminSection) => void;
  onLogout: () => void;
  onLeave: () => void;
}

export function AdminSidebar({
  active,
  onChange,
  onLogout,
  onLeave,
  ...props
}: Props) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                <img
                  src="/logo-mark.svg"
                  alt="launOmeter"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Laun<span className="text-[#3fb78a]">O</span>Meter
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Administration
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Bereiche</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={active === item.key}
                      tooltip={item.label}
                      onClick={() => onChange(item.key)}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Zur Stimmabgabe"
            >
              <Link
                to="/"
                onClick={onLeave}
              >
                <ArrowLeft />
                <span>Zur Stimmabgabe</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Abmelden"
              onClick={onLogout}
            >
              <LogOut />
              <span>Abmelden</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
