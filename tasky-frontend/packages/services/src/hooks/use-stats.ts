import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { ApiResponse } from "../api/client";
import type { StatsResponse } from "../types/task";
import { queryKeys } from "../query-keys";

export function useTaskStats() {
  return useQuery({
    queryKey: queryKeys.stats.dashboard(),
    queryFn: async () => {
      const { data } =
        await apiClient.get<ApiResponse<StatsResponse>>("/api/v1/stats");
      return data.data;
    },
  });
}
