import {
  AnimatedThemeToggler,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LightRays,
  ShineBorder,
} from "@tasky/ui";
import { useTheme } from "@/contexts/theme-context";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard } from "lucide-react";

interface AuthCardProps {
  readonly title?: string;
  readonly description?: string;
  readonly icon?: LucideIcon;
  readonly brandOnly?: boolean;
  readonly tagline?: string;
  readonly children: React.ReactNode;
}

interface AuthLayoutProps {
  readonly children: React.ReactNode;
}

export function AuthCard({
  title,
  description,
  icon: Icon,
  brandOnly,
  tagline,
  children,
}: AuthCardProps) {
  return (
    <Card className="relative w-full max-w-md min-w-0 overflow-hidden rounded-2xl border-(--border)/60 bg-(--card)/80 shadow-2xl ring-1 shadow-black/5 ring-(--border)/50 backdrop-blur-xl dark:bg-(--card)/90 dark:shadow-black/20 dark:ring-(--border)/40">
      <ShineBorder
        shineColor="var(--primary)"
        borderWidth={1.5}
        duration={14}
        className="rounded-2xl"
      />
      <CardHeader className="relative z-10 space-y-2 pt-8 pb-5 text-center">
        {brandOnly ? (
          <div className="font-brand flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--primary)/15 shadow-inner sm:h-14 sm:w-14">
                <LayoutDashboard
                  className="h-6 w-6 text-(--primary) sm:h-7 sm:w-7"
                  aria-hidden
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-(--primary) sm:text-3xl">
                Tasky
              </span>
            </div>
            {tagline && (
              <p className="text-sm text-(--muted-foreground) sm:text-base">
                {tagline}
              </p>
            )}
          </div>
        ) : (
          <>
            {Icon && (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--primary)/10">
                <Icon className="h-7 w-7 text-(--primary)" aria-hidden />
              </div>
            )}
            {title && (
              <CardTitle className="text-2xl font-bold tracking-tight">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm leading-relaxed">
                {description}
              </CardDescription>
            )}
          </>
        )}
      </CardHeader>
      <CardContent className="relative z-10 px-4 pt-0 pb-6 sm:px-6 sm:pb-8">
        {children}
      </CardContent>
    </Card>
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const raysColor = isDark
    ? "rgba(80, 180, 140, 0.12)"
    : "rgba(60, 160, 120, 0.15)";

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-(--background) p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] sm:p-4">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.38 0.08 155 / 0.22) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 80% 80%, oklch(0.32 0.06 155 / 0.14) 0%, transparent 50%), linear-gradient(180deg, var(--background) 0%, oklch(0.2 0.03 150) 100%)"
            : "radial-gradient(ellipse 90% 55% at 50% -10%, oklch(0.7 0.12 155 / 0.18) 0%, transparent 50%), radial-gradient(ellipse 70% 45% at 100% 100%, oklch(0.78 0.08 155 / 0.12) 0%, transparent 45%), linear-gradient(180deg, oklch(0.99 0.008 150) 0%, var(--background) 100%)",
        }}
      />
      <div className="absolute inset-0 z-0 overflow-hidden">
        <LightRays
          className="inset-0"
          count={6}
          color={raysColor}
          blur={56}
          opacity={isDark ? 0.35 : 0.45}
          speed={14}
          length="80vh"
        />
      </div>
      <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-20 sm:top-4 sm:right-4">
        <AnimatedThemeToggler theme={theme} onThemeChange={setTheme} />
      </div>
      <div
        className="relative z-20 flex w-full flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto py-4"
        style={{ maxHeight: "calc(100dvh - 2rem)" }}
      >
        <div className="w-full max-w-md shrink-0 px-2 sm:px-0">{children}</div>
      </div>
    </div>
  );
}
