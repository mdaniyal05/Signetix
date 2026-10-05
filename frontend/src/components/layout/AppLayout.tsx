import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Hand,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PhoneCall,
  Settings as SettingsIcon,
  Users,
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { CallSignalingProvider } from "@/realtime/CallSignalingProvider";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/chats", label: "Chats", icon: MessageSquare, end: false },
  { to: "/contacts", label: "Contacts", icon: Users, end: false },
  { to: "/history", label: "Calls", icon: PhoneCall, end: false },
  { to: "/settings", label: "Settings", icon: SettingsIcon, end: false },
];

export function AppLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <CallSignalingProvider>
      <div className="flex h-screen bg-muted/30">
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-background sm:flex">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hand className="size-5" />
            </div>
            <span className="text-lg font-semibold">Signetix</span>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
            <MobileNav />
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <UserAvatar
                      name={session?.name ?? "User"}
                      src={session?.profilePicture}
                      className="size-8"
                    />
                    <span className="hidden text-sm font-medium sm:inline">
                      {session?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{session?.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {session?.phoneNumber}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <SettingsIcon />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </CallSignalingProvider>
  );
}

/** Compact nav shown on small screens where the sidebar is hidden. */
function MobileNav() {
  return (
    <nav className="flex items-center gap-1 sm:hidden">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          aria-label={label}
          className={({ isActive }) =>
            cn(
              "flex size-9 items-center justify-center rounded-md",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent",
            )
          }
        >
          <Icon className="size-4" />
        </NavLink>
      ))}
    </nav>
  );
}
