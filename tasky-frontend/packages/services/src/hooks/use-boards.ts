import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { ApiResponse } from "../api/client";
import type { Board } from "../types/task";
import type { CreateBoardRequest } from "../types/task";
import { queryKeys } from "../query-keys";

export function useBoards() {
  return useQuery({
    queryKey: queryKeys.boards.list(),
    queryFn: async () => {
      const { data } =
        await apiClient.get<ApiResponse<Board[]>>("/api/v1/boards");
      return data.data;
    },
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateBoardRequest) => {
      const { data } = await apiClient.post<ApiResponse<Board>>(
        "/api/v1/boards",
        request
      );
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.all() });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (boardId: string) => {
      await apiClient.delete(`/api/v1/boards/${boardId}`);
    },
    onSuccess: (_, boardId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.all() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.board(boardId),
      });
    },
  });
}
