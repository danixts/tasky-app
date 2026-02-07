import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { ApiResponse } from "../api/client";
import type {
  Task,
  TaskStatus,
  TaskBoardResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
} from "../types/task";
import { queryKeys } from "../query-keys";

export function taskBoardQueryOptions(boardId: string | null | undefined) {
  return {
    queryKey: queryKeys.tasks.board(boardId ?? undefined),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<TaskBoardResponse>>(
        "/api/v1/tasks/board",
        { params: { boardId } }
      );
      return data.data;
    },
    enabled: !!boardId,
  };
}

export function useTasks(status?: TaskStatus) {
  return useQuery({
    queryKey: queryKeys.tasks.list(status),
    queryFn: async () => {
      const params = status ? { status } : {};
      const { data } = await apiClient.get<ApiResponse<Task[]>>(
        "/api/v1/tasks",
        { params }
      );
      return data.data;
    },
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Task>>(
        `/api/v1/tasks/${taskId}`
      );
      return data.data;
    },
    enabled: !!taskId,
  });
}

export function useTaskBoard(boardId: string | null | undefined) {
  return useQuery(taskBoardQueryOptions(boardId));
}

export function useCreateTask() {
  return useMutation({
    mutationFn: async (task: CreateTaskRequest) => {
      const { data } = await apiClient.post<ApiResponse<Task>>(
        "/api/v1/tasks",
        task
      );
      return data.data;
    },
  });
}

export function useUpdateTask() {
  return useMutation({
    mutationFn: async ({
      taskId,
      ...task
    }: UpdateTaskRequest & { taskId: string }) => {
      const { data } = await apiClient.put<ApiResponse<Task>>(
        `/api/v1/tasks/${taskId}`,
        task
      );
      return data.data;
    },
  });
}

export function useMoveTask() {
  return useMutation({
    mutationFn: async ({
      taskId,
      statusId,
      position,
    }: MoveTaskRequest & { taskId: string }) => {
      const { data } = await apiClient.patch<ApiResponse<Task>>(
        `/api/v1/tasks/${taskId}/move`,
        { statusId, position }
      );
      return data.data;
    },
  });
}

export function useDeleteTask() {
  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/api/v1/tasks/${taskId}`);
    },
  });
}
