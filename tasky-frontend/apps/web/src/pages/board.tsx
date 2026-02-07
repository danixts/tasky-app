import { useEffect, useState } from "react";
import { KanbanBoard } from "@/components/task-board";
import { useBoards, useCreateBoard } from "@tasky/services";
import { Button, Input } from "@tasky/ui";
import { useToast } from "@/hooks/use-toast";

export function BoardPage() {
  const { data: boards, isLoading: boardsLoading } = useBoards();
  const createBoard = useCreateBoard();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [showNewBoard, setShowNewBoard] = useState(false);

  useEffect(() => {
    if (boards?.length && !selectedId) {
      setSelectedId(boards[0].boardId);
    }
  }, [boards, selectedId]);

  const handleCreateBoard = () => {
    const name = newBoardName.trim();
    if (!name) return;
    createBoard.mutate(
      { name },
      {
        onSuccess: (board) => {
          setSelectedId(board.boardId);
          setNewBoardName("");
          setShowNewBoard(false);
          toast.success("Tablero creado", name);
        },
        onError: () => toast.error("Error", "No se pudo crear el tablero"),
      }
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-(--background)">
      <div className="shrink-0 border-b border-(--border)/60 bg-(--background) px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value || null)}
            className="h-9 min-w-[180px] rounded-lg border border-(--input) bg-(--background) px-3 py-1.5 text-sm text-(--foreground)"
            disabled={boardsLoading}
          >
            <option value="">
              {boardsLoading ? "Cargando..." : "Seleccionar tablero"}
            </option>
            {boards?.map((b) => (
              <option key={b.boardId} value={b.boardId}>
                {b.name}
              </option>
            ))}
          </select>
          {showNewBoard ? (
            <div className="flex items-center gap-2">
              <Input
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Nombre del tablero"
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
                Crear
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
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewBoard(true)}
              className="rounded-lg"
            >
              Nuevo tablero
            </Button>
          )}
        </div>
      </div>
      <KanbanBoard boardId={selectedId} />
    </div>
  );
}
