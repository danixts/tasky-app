import type { TaskStatus } from "./types/task";

export const queryKeys = {
  auth: {
    all: () => ["auth"] as const,
  },
  boards: {
    all: () => ["boards"] as const,
    list: () => [...queryKeys.boards.all(), "list"] as const,
    detail: (id: string) => [...queryKeys.boards.all(), "detail", id] as const,
  },
  tasks: {
    all: () => ["tasks"] as const,
    list: (status?: TaskStatus) =>
      [...queryKeys.tasks.all(), "list", status] as const,
    detail: (id: string) => [...queryKeys.tasks.all(), "detail", id] as const,
    board: (boardId?: string) =>
      [...queryKeys.tasks.all(), "board", boardId] as const,
  },
  stats: {
    all: () => ["stats"] as const,
    dashboard: () => [...queryKeys.stats.all(), "dashboard"] as const,
    tasksByStatus: () => [...queryKeys.stats.all(), "tasksByStatus"] as const,
    tasksByBoard: () => [...queryKeys.stats.all(), "tasksByBoard"] as const,
  },
};
