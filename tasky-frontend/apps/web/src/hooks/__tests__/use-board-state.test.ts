import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBoardState } from "../use-board-state";
import type { TaskBoard } from "@tasky/services";

const emptyBoard: TaskBoard = {
  pending: [],
  inProgress: [],
  completed: [],
};

const boardWithTask: TaskBoard = {
  pending: [
    {
      taskId: "t1",
      title: "Task",
      description: null,
      status: "PENDING",
      priority: "NORMAL",
      createdAt: "2026-01-01T00:00:00",
      updatedAt: "2026-01-01T00:00:00",
    },
  ],
  inProgress: [],
  completed: [],
};

describe("useBoardState", () => {
  it("returns displayBoard as null when serverBoard is null", () => {
    const { result } = renderHook(() => useBoardState(null));
    expect(result.current.displayBoard).toBeNull();
    expect(result.current.getTasksForStatus("PENDING")).toEqual([]);
  });

  it("syncs displayBoard when serverBoard is provided", () => {
    const { result } = renderHook(() => useBoardState(emptyBoard));
    expect(result.current.displayBoard).toEqual(emptyBoard);
    expect(result.current.board).toEqual(emptyBoard);
  });

  it("getTasksForStatus returns tasks for given status", () => {
    const { result } = renderHook(() => useBoardState(boardWithTask));
    expect(result.current.getTasksForStatus("PENDING")).toHaveLength(1);
    expect(result.current.getTasksForStatus("PENDING")[0].taskId).toBe("t1");
    expect(result.current.getTasksForStatus("IN_PROGRESS")).toEqual([]);
  });

  it("updates when serverBoard changes", () => {
    const { result, rerender } = renderHook(
      (serverBoard: TaskBoard | null) => useBoardState(serverBoard),
      { initialProps: null }
    );
    expect(result.current.displayBoard).toBeNull();

    rerender(emptyBoard);
    expect(result.current.displayBoard).toEqual(emptyBoard);

    rerender(boardWithTask);
    expect(result.current.displayBoard).toEqual(boardWithTask);
    expect(result.current.getTasksForStatus("PENDING")).toHaveLength(1);
  });

  it("setBoard updates local board and displayBoard", () => {
    const { result } = renderHook(() => useBoardState(emptyBoard));
    const newBoard: TaskBoard = {
      ...emptyBoard,
      pending: [
        {
          taskId: "local-1",
          title: "Local",
          description: null,
          status: "PENDING",
          priority: "NORMAL",
          createdAt: "2026-01-01T00:00:00",
          updatedAt: "2026-01-01T00:00:00",
        },
      ],
    };

    act(() => {
      result.current.setBoard(newBoard);
    });

    expect(result.current.displayBoard).toEqual(newBoard);
    expect(result.current.getTasksForStatus("PENDING")).toHaveLength(1);
    expect(result.current.getTasksForStatus("PENDING")[0].title).toBe("Local");
  });

  it("clears board when serverBoard becomes null after having value", () => {
    const { result, rerender } = renderHook(
      (serverBoard: TaskBoard | null | undefined) => useBoardState(serverBoard),
      { initialProps: emptyBoard as TaskBoard | undefined }
    );
    expect(result.current.displayBoard).toEqual(emptyBoard);

    rerender(null);
    expect(result.current.displayBoard).toBeNull();
  });
});
