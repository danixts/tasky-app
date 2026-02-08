export type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  Task,
  TaskStatus,
  TaskPriority,
  TaskBoard,
  TaskBoardResponse,
  Board,
  BoardStatus,
  BoardColumn,
  CreateBoardRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  TaskCountByStatus,
  TaskCountByBoardAndStatus,
  StatsResponse,
} from "./types";

export {
  apiClient,
  getToken,
  getRefreshToken,
  getUsername,
  saveAuth,
  clearAuth,
  isAuthenticated,
} from "./api/client";
export type { ApiResponse } from "./api/client";

export { useLogin, useRegister, useLogout } from "./hooks/use-auth";
export { useBoards, useCreateBoard, useDeleteBoard } from "./hooks/use-boards";
export {
  taskBoardQueryOptions,
  useTasks,
  useTask,
  useTaskBoard,
  useCreateTask,
  useUpdateTask,
  useMoveTask,
  useDeleteTask,
} from "./hooks/use-tasks";
export { useTaskStats } from "./hooks/use-stats";

export { queryKeys } from "./query-keys";
