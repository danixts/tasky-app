import { create } from "zustand";
import type { Board } from "@tasky/services";

interface BoardsState {
  boards: Board[];
  setBoards: (boards: Board[]) => void;
  addBoard: (board: Board) => void;
  mergeBoards: (serverBoards: Board[]) => Board[];
}

export const useBoardsStore = create<BoardsState>((set, get) => ({
  boards: [],
  setBoards: (boards) => set({ boards }),
  addBoard: (board) =>
    set((state) => ({
      boards: state.boards.some((b) => b.boardId === board.boardId)
        ? state.boards.map((b) => (b.boardId === board.boardId ? board : b))
        : [board, ...state.boards],
    })),
  mergeBoards: (serverBoards) => {
    const { boards: cached } = get();
    const serverIds = new Set(serverBoards.map((b) => b.boardId));
    const onlyInCache = cached.filter((b) => !serverIds.has(b.boardId));
    const merged = [...serverBoards, ...onlyInCache].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    set({ boards: merged });
    return merged;
  },
}));
