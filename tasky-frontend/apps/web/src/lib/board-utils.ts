import type {
  Task,
  TaskStatus,
  TaskBoard,
  TaskPriority,
  TaskBoardResponse,
  BoardStatus,
} from "@tasky/services";

export function taskBoardResponseToTaskBoard(
  response: TaskBoardResponse | null | undefined
): TaskBoard | null {
  if (!response?.statuses?.length || !response?.columns) return null;
  const codeToStatus = (code: string): TaskStatus =>
    code === "TODO"
      ? "PENDING"
      : code === "IN_PROGRESS"
        ? "IN_PROGRESS"
        : "COMPLETED";
  const pendingCol = response.columns.find(
    (c) =>
      response.statuses.find((s) => s.statusId === c.statusId)?.code === "TODO"
  );
  const inProgressCol = response.columns.find(
    (c) =>
      response.statuses.find((s) => s.statusId === c.statusId)?.code ===
      "IN_PROGRESS"
  );
  const completedCol = response.columns.find(
    (c) =>
      response.statuses.find((s) => s.statusId === c.statusId)?.code ===
      "COMPLETED"
  );
  return {
    pending: pendingCol?.tasks ?? [],
    inProgress: inProgressCol?.tasks ?? [],
    completed: completedCol?.tasks ?? [],
  };
}

export function getStatusIdForStatus(
  response: TaskBoardResponse | null | undefined,
  status: TaskStatus
): string | null {
  if (!response?.statuses) return null;
  const code =
    status === "PENDING"
      ? "TODO"
      : status === "IN_PROGRESS"
        ? "IN_PROGRESS"
        : "COMPLETED";
  const s = response.statuses.find((x) => x.code === code);
  return s?.statusId ?? null;
}

export const TASK_STATUSES: readonly TaskStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
];

export const BOARD_COLUMN_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  PENDING: {
    label: "To Do",
    color: "text-(--column-pending-text)",
    bg: "bg-(--column-pending-bg)",
    icon: "📋",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-(--column-progress-text)",
    bg: "bg-(--column-progress-bg)",
    icon: "🔄",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-(--column-completed-text)",
    bg: "bg-(--column-completed-bg)",
    icon: "✅",
  },
};

function getListForStatus(board: TaskBoard, status: TaskStatus): Task[] {
  switch (status) {
    case "PENDING":
      return board.pending;
    case "IN_PROGRESS":
      return board.inProgress;
    case "COMPLETED":
      return board.completed;
  }
}

export function getTasksByStatus(
  board: TaskBoard | null,
  status: TaskStatus
): Task[] {
  if (!board) return [];
  return getListForStatus(board, status);
}

export function getAllTasks(board: TaskBoard): Task[] {
  return [...board.pending, ...board.inProgress, ...board.completed];
}

export function findTask(
  board: TaskBoard | null,
  taskId: string
): Task | undefined {
  if (!board) return undefined;
  return getAllTasks(board).find((t) => t.taskId === taskId);
}

export function removeTask(board: TaskBoard, taskId: string): TaskBoard {
  const filter = (list: Task[]) => list.filter((t) => t.taskId !== taskId);
  return {
    pending: filter(board.pending),
    inProgress: filter(board.inProgress),
    completed: filter(board.completed),
  };
}

export function addTaskToStatus(
  board: TaskBoard,
  status: TaskStatus,
  task: Task
): TaskBoard {
  const list = getListForStatus(board, status);
  const next = [...list, task];
  switch (status) {
    case "PENDING":
      return { ...board, pending: next };
    case "IN_PROGRESS":
      return { ...board, inProgress: next };
    case "COMPLETED":
      return { ...board, completed: next };
  }
}

export function replaceTaskInBoard(board: TaskBoard, task: Task): TaskBoard {
  const without = removeTask(board, task.taskId);
  return addTaskToStatus(without, task.status, task);
}

export function replaceTaskById(
  board: TaskBoard,
  oldTaskId: string,
  newTask: Task
): TaskBoard {
  const without = removeTask(board, oldTaskId);
  return addTaskToStatus(without, newTask.status, newTask);
}

export function reorderInStatus(
  board: TaskBoard,
  status: TaskStatus,
  taskId: string,
  overTaskId: string
): TaskBoard {
  const list = [...getListForStatus(board, status)];
  const fromIdx = list.findIndex((t) => t.taskId === taskId);
  const toIdx = list.findIndex((t) => t.taskId === overTaskId);
  if (fromIdx === -1 || toIdx === -1) return board;
  const [removed] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, removed);
  switch (status) {
    case "PENDING":
      return { ...board, pending: list };
    case "IN_PROGRESS":
      return { ...board, inProgress: list };
    case "COMPLETED":
      return { ...board, completed: list };
  }
}

export function moveTaskToStatus(
  board: TaskBoard,
  taskId: string,
  targetStatus: TaskStatus
): TaskBoard {
  const task = findTask(board, taskId);
  if (!task) return board;
  const updated = {
    ...task,
    status: targetStatus,
    updatedAt: new Date().toISOString(),
  };
  const without = removeTask(board, taskId);
  return addTaskToStatus(without, targetStatus, updated);
}

export function createTaskData(
  title: string,
  status: TaskStatus,
  description?: string | null,
  priority: TaskPriority = "NORMAL"
): Task {
  const now = new Date().toISOString();
  return {
    taskId: crypto.randomUUID(),
    title,
    description: description ?? null,
    status,
    priority,
    createdAt: now,
    updatedAt: now,
  };
}

export function isColumnId(id: string): id is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(id);
}
