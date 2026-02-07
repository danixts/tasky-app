import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
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
import { LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@tasky/ui/lib/utils";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { username, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = useLocation({ select: (loc) => loc.pathname });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const isBoardActive = pathname === "/";
  const isDark = theme === "dark";
  const raysColor = isDark
    ? "rgba(100, 180, 220, 0.08)"
    : "rgba(120, 180, 230, 0.12)";

  const sidebarLinkClass = (active: boolean) =>
    cn(
      "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors sm:min-h-10 sm:min-w-10",
      active
        ? "bg-(--primary)/15 text-(--primary)"
        : "text-(--muted-foreground) hover:bg-(--accent) hover:text-(--accent-foreground)"
    );

  return (
    <div className="relative flex min-h-dvh flex-col bg-(--muted)/30">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <LightRays
          className="inset-0"
          count={5}
          color={raysColor}
          blur={48}
          opacity={isDark ? 0.25 : 0.35}
          speed={18}
          length="100dvh"
        />
      </div>

      <aside className="fixed top-0 left-0 z-40 flex w-16 flex-col items-center gap-1 border-r border-(--border) bg-(--background)/95 pt-[env(safe-area-inset-top)] backdrop-blur md:w-20">
        <div className="flex h-14 w-full items-center justify-center border-b border-(--border)/50 md:h-16">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)"
          >
            <LayoutDashboard className="h-5 w-5" />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-3">
          <Link
            to="/"
            className={sidebarLinkClass(isBoardActive)}
            title="Board"
          >
            <LayoutDashboard className="h-5 w-5" />
          </Link>
        </nav>
      </aside>

      <div className="relative z-1 flex min-h-0 flex-1 flex-col pl-16 md:pl-20">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-(--border) bg-(--background)/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <nav
              className="text-xs font-medium text-(--muted-foreground) md:text-sm"
              aria-label="Breadcrumb"
            >
              <span>
                Tasks
                <span className="mx-1.5 text-(--muted-foreground)/60">/</span>
                <span className="text-(--foreground)">
                  {isBoardActive ? "Board" : "Tasks"}
                </span>
              </span>
            </nav>
            <h1 className="truncate text-lg font-semibold text-(--foreground) md:text-xl">
              Task Management
            </h1>
          </div>
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
                className="w-56 border-(--border) bg-(--background) p-0 shadow-lg"
                align="end"
                sideOffset={8}
              >
                <div className="border-b border-(--border) p-3">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="mt-0.5 text-xs text-(--muted-foreground)">
                    Active user
                  </p>
                </div>
                {showLogoutConfirm ? (
                  <div className="p-3">
                    <p className="text-sm font-medium">
                      ¿Estás seguro de cerrar sesión?
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowLogoutConfirm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setShowLogoutConfirm(false);
                          void logout();
                        }}
                      >
                        Cerrar sesión
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-1">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(true)}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none hover:bg-(--accent) dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
