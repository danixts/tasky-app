import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { taskBoardQueryOptions, useBoards, useCreateBoard } from "@tasky/services";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  LightRays,
  Skeleton,
} from "@tasky/ui";
import { useToast } from "@/hooks/use-toast";
import { useBoardsStore } from "@/stores/boards-store";
import { useTheme } from "@/contexts/theme-context";
import { LayoutDashboard, Plus } from "lucide-react";

export function BoardListPage() {
  const queryClient = useQueryClient();
  const { data: serverBoards, isLoading } = useBoards();
  const { mergeBoards, boards } = useBoardsStore();
  const createBoard = useCreateBoard();
  const toast = useToast();
  const { theme } = useTheme();
  const [newBoardName, setNewBoardName] = useState("");
  const [showNewBoard, setShowNewBoard] = useState(false);
  const isDark = theme === "dark";
  const raysColor = isDark
    ? "rgba(100, 180, 220, 0.04)"
    : "rgba(120, 180, 230, 0.06)";

  useEffect(() => {
    if (serverBoards?.length !== undefined) {
      mergeBoards(serverBoards);
    }
  }, [serverBoards, mergeBoards]);

  const displayBoards = boards.length > 0 ? boards : (serverBoards ?? []);

  const handleCreateBoard = () => {
    const name = newBoardName.trim();
    if (!name) return;
    createBoard.mutate(
      { name },
      {
        onSuccess: (board) => {
          useBoardsStore.getState().addBoard(board);
          setNewBoardName("");
          setShowNewBoard(false);
          toast.success("Board created", name);
        },
        onError: () => toast.error("Error", "Could not create the board"),
      }
    );
  };

  function renderBoardListContent() {
    if (isLoading && displayBoards.length === 0) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="h-32 rounded-xl border-(--border) bg-(--card)/70 backdrop-blur-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 shrink-0 rounded" />
                  <Skeleton className="h-4 max-w-[140px] flex-1 rounded" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-3 w-24 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    if (displayBoards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="rounded-2xl border border-dashed border-(--border) bg-(--muted)/20 p-8">
            <LayoutDashboard className="mx-auto h-12 w-12 text-(--muted-foreground)" />
          </div>
          <p className="text-sm text-(--muted-foreground)">
            No boards. Create one to get started.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowNewBoard(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New board
          </Button>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayBoards.map((board) => (
          <Link
            key={board.boardId}
            to="/board/$boardId"
            params={{ boardId: board.boardId }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
            onMouseEnter={() =>
              void queryClient.prefetchQuery(taskBoardQueryOptions(board.boardId))
            }
          >
            <Card className="h-32 border-(--border) bg-(--card)/70 backdrop-blur-md transition-all duration-200 hover:border-(--primary)/40 hover:bg-(--card)/85 hover:shadow-md dark:bg-(--card)/60 dark:hover:bg-(--card)/75">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-(--foreground)">
                  <LayoutDashboard className="h-4 w-4 shrink-0 text-(--muted-foreground)" />
                  <span className="truncate">{board.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-(--muted-foreground)">Open board</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-(--foreground)">Boards</h2>
          {showNewBoard ? (
            <div className="flex items-center gap-2">
              <Input
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name"
                className="h-9 w-48 rounded-lg text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateBoard();
                  if (e.key === "Escape") {
                    setShowNewBoard(false);
                    setNewBoardName("");
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCreateBoard}
                disabled={!newBoardName.trim() || createBoard.isPending}
                className="rounded-lg"
              >
                Create
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNewBoard(false);
                  setNewBoardName("");
                }}
                className="rounded-lg"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowNewBoard(true)}
              className="gap-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              New board
            </Button>
          )}
        </div>
      </div>
      <div className="relative z-10 min-h-0 flex-1 overflow-auto p-4 md:p-6">
        {renderBoardListContent()}
      </div>
    </div>
  );
}
