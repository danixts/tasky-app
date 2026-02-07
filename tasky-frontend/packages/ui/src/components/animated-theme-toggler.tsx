import { useCallback, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { cn } from "../lib/utils";

export type Theme = "light" | "dark";

type AnimatedThemeTogglerProps = Omit<
  Readonly<React.ComponentPropsWithoutRef<"button">>,
  "onClick"
> & {
  readonly duration?: number;
  readonly theme: Theme;
  readonly onThemeChange: (theme: Theme) => void;
};

export function AnimatedThemeToggler({
  className,
  duration = 400,
  theme,
  onThemeChange,
  ...props
}: AnimatedThemeTogglerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isDark = theme === "dark";

  const toggleTheme = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!buttonRef.current) return;

      const newTheme: Theme = isDark ? "light" : "dark";
      const supportsViewTransitions =
        typeof document.startViewTransition === "function";

      if (supportsViewTransitions) {
        const transition = document.startViewTransition(() => {
          flushSync(() => {
            onThemeChange(newTheme);
          });
        });

        await transition.ready;

        const { top, left, width, height } =
          buttonRef.current.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const maxRadius = Math.hypot(
          Math.max(left, window.innerWidth - left),
          Math.max(top, window.innerHeight - top)
        );

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        return;
      }
      onThemeChange(newTheme);
    },
    [isDark, duration, onThemeChange]
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--foreground) transition-colors hover:bg-(--accent) hover:text-(--accent-foreground)",
        className
      )}
      aria-label={isDark ? "Use light theme" : "Use dark theme"}
      {...props}
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  );
}
