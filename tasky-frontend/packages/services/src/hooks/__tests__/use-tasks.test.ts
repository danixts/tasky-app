import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useCreateTask,
  useUpdateTask,
  useMoveTask,
  useDeleteTask,
} from "../use-tasks";
import { apiClient } from "../../api/client";

vi.mock("../../api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe("useCreateTask", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        data: {
          taskId: "new-id",
          title: "New task",
          description: null,
          status: "PENDING",
          priority: "NORMAL",
          createdAt: "",
          updatedAt: "",
        },
        message: "OK",
        success: true,
        errors: null,
      },
    });
  });

  it("calls apiClient.post with /api/v1/tasks and request body when mutate is invoked", async () => {
    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });
    const body = {
      boardId: "board-1",
      title: "Test task",
      description: "Desc",
      priority: "NORMAL" as const,
    };
    result.current.mutate(body);
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/tasks", body);
  });
});

describe("useUpdateTask", () => {
  beforeEach(() => {
    vi.mocked(apiClient.put).mockReset();
    vi.mocked(apiClient.put).mockResolvedValue({
      data: {
        data: {},
        message: "OK",
        success: true,
        errors: null,
      },
    });
  });

  it("calls apiClient.put with taskId in path and body when mutate is invoked", async () => {
    const { result } = renderHook(() => useUpdateTask(), {
      wrapper: createWrapper(),
    });
    const payload = {
      taskId: "task-1",
      title: "Updated",
      description: "Updated desc",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
    };
    result.current.mutate(payload);
    await waitFor(() => expect(apiClient.put).toHaveBeenCalledTimes(1));
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/tasks/task-1", {
      title: "Updated",
      description: "Updated desc",
      status: "IN_PROGRESS",
      priority: "HIGH",
    });
  });
});

describe("useMoveTask", () => {
  beforeEach(() => {
    vi.mocked(apiClient.patch).mockReset();
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: {
        data: {},
        message: "OK",
        success: true,
        errors: null,
      },
    });
  });

  it("calls apiClient.patch with taskId in path and statusId, position in body when mutate is invoked", async () => {
    const { result } = renderHook(() => useMoveTask(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      taskId: "task-1",
      statusId: "status-1",
      position: 0,
    });
    await waitFor(() => expect(apiClient.patch).toHaveBeenCalledTimes(1));
    expect(apiClient.patch).toHaveBeenCalledWith("/api/v1/tasks/task-1/move", {
      statusId: "status-1",
      position: 0,
    });
  });
});

describe("useDeleteTask", () => {
  beforeEach(() => {
    vi.mocked(apiClient.delete).mockReset();
    vi.mocked(apiClient.delete).mockResolvedValue(undefined);
  });

  it("calls apiClient.delete with /api/v1/tasks/{taskId} when mutate is invoked", async () => {
    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: createWrapper(),
    });
    result.current.mutate("task-1");
    await waitFor(() => expect(apiClient.delete).toHaveBeenCalledTimes(1));
    expect(apiClient.delete).toHaveBeenCalledWith("/api/v1/tasks/task-1");
  });
});
