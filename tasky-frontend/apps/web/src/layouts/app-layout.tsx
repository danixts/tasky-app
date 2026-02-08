import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import {
  AnimatedThemeToggler,
  Avatar,
  AvatarFallback,
  Button,
  LightRays,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tasky/ui";
import { LogOut, LayoutGrid, BarChart2 } from "lucide-react";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { username, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const isDark = theme === "dark";
  const raysColor = isDark
    ? "rgba(100, 180, 220, 0.04)"
    : "rgba(120, 180, 230, 0.06)";

  return (
    <div className="relative flex min-h-dvh flex-col bg-(--muted)/30">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <LightRays
          className="inset-0"
          count={3}
          color={raysColor}
          blur={64}
          opacity={isDark ? 0.12 : 0.18}
          speed={22}
          length="100dvh"
        />
      </div>

      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-(--border) bg-(--background)/95 px-4 py-3 backdrop-blur md:px-6">
        <nav
          className="flex min-w-0 flex-1 items-center gap-2"
          aria-label="Main"
        >
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--primary) text-(--primary-foreground)">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-(--foreground) md:text-xl">
              Tasky
            </span>
          </Link>
          <Link
            to="/stats"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-(--muted-foreground) transition-colors outline-none hover:bg-(--accent) hover:text-(--accent-foreground) focus-visible:ring-2 focus-visible:ring-(--ring)"
          >
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Estadísticas</span>
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <AnimatedThemeToggler
            theme={theme}
            onThemeChange={setTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--accent)"
          />
          <Popover
            open={userMenuOpen}
            onOpenChange={(open) => {
              setUserMenuOpen(open);
              if (!open) setShowLogoutConfirm(false);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-(--primary)/10 text-xs font-medium text-(--primary)">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 rounded-xl border-(--border) bg-(--popover)/80 p-0 shadow-xl backdrop-blur-xl"
              align="end"
              sideOffset={8}
            >
              <div className="border-b border-(--border)/60 px-3 py-3">
                <p className="text-sm font-medium text-(--foreground)">
                  {username}
                </p>
                <p className="mt-0.5 text-xs text-(--muted-foreground)">
                  Active user
                </p>
              </div>
              {showLogoutConfirm ? (
                <div className="p-3">
                  <p className="text-sm font-medium text-(--foreground)">
                    Are you sure you want to sign out?
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowLogoutConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="flex-1 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowLogoutConfirm(false);
                        void logout();
                      }}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 transition-colors outline-none hover:bg-(--accent) focus-visible:ring-2 focus-visible:ring-(--ring) dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main className="relative z-1 flex min-h-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
