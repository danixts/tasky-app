import { Link, useParams } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/task-board";
import { Button, LightRays } from "@tasky/ui";
import { useTheme } from "@/contexts/theme-context";
import { LayoutGrid } from "lucide-react";

export function BoardPage() {
  const { boardId } = useParams({ strict: false });
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const raysColor = isDark
    ? "rgba(100, 180, 220, 0.04)"
    : "rgba(120, 180, 230, 0.06)";

  if (!boardId) {
    return null;
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <LightRays
          className="inset-0"
          count={3}
          color={raysColor}
          blur={64}
          opacity={isDark ? 0.12 : 0.18}
          speed={22}
          length="100%"
        />
      </div>
      <div className="relative z-10 shrink-0 border-b border-(--border)/60 bg-(--background)/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2 rounded-lg"
            asChild
          >
            <Link to="/">
              <LayoutGrid className="h-4 w-4" />
              Boards
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <KanbanBoard boardId={boardId} />
      </div>
    </div>
  );
}
