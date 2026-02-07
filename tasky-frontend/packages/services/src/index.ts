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
export { useBoards, useCreateBoard } from "./hooks/use-boards";
export {
  useTasks,
  useTask,
  useTaskBoard,
  useCreateTask,
  useUpdateTask,
  useMoveTask,
  useDeleteTask,
} from "./hooks/use-tasks";

export { queryKeys } from "./query-keys";
