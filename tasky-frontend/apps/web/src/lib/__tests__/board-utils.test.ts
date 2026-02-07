import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  taskBoardResponseToTaskBoard,
  getStatusIdForStatus,
  getTasksByStatus,
  getAllTasks,
  findTask,
  removeTask,
  addTaskToStatus,
  replaceTaskInBoard,
  replaceTaskById,
  reorderInStatus,
  moveTaskToStatus,
  createTaskData,
  isColumnId,
  TASK_STATUSES,
} from "../board-utils";
import type { Task, TaskBoard, TaskBoardResponse } from "@tasky/services";

const mockTask = (overrides?: Partial<Task>): Task => ({
  taskId: "t1",
  title: "Task",
  description: null,
  status: "PENDING",
  priority: "NORMAL",
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
  ...overrides,
});

const mockBoard: TaskBoard = {
  pending: [mockTask({ taskId: "p1", status: "PENDING" })],
  inProgress: [mockTask({ taskId: "i1", status: "IN_PROGRESS" })],
  completed: [mockTask({ taskId: "c1", status: "COMPLETED" })],
};

describe("board-utils", () => {
  describe("taskBoardResponseToTaskBoard", () => {
    it("returns null when response is null", () => {
      expect(taskBoardResponseToTaskBoard(null)).toBeNull();
    });

    it("returns null when statuses are empty", () => {
      expect(
        taskBoardResponseToTaskBoard({
          statuses: [],
          columns: [],
        } as TaskBoardResponse)
      ).toBeNull();
    });

    it("returns null when columns are missing", () => {
      expect(
        taskBoardResponseToTaskBoard({
          statuses: [
            { statusId: "s1", code: "TODO", label: "To Do", position: 0 },
          ],
          columns: undefined,
        } as unknown as TaskBoardResponse)
      ).toBeNull();
    });

    it("maps response columns to board by status code", () => {
      const t1 = mockTask({ taskId: "a" });
      const t2 = mockTask({ taskId: "b", status: "IN_PROGRESS" });
      const response: TaskBoardResponse = {
        boardId: "b1",
        boardName: "Board",
        statuses: [
          { statusId: "s-pending", code: "TODO", label: "To Do", position: 0 },
          {
            statusId: "s-progress",
            code: "IN_PROGRESS",
            label: "In Progress",
            position: 1,
          },
          { statusId: "s-done", code: "COMPLETED", label: "Done", position: 2 },
        ],
        columns: [
          { statusId: "s-pending", tasks: [t1] },
          { statusId: "s-progress", tasks: [t2] },
          { statusId: "s-done", tasks: [] },
        ],
      };
      const result = taskBoardResponseToTaskBoard(response);
      expect(result).not.toBeNull();
      expect(result!.pending).toEqual([t1]);
      expect(result!.inProgress).toEqual([t2]);
      expect(result!.completed).toEqual([]);
    });
  });

  describe("getStatusIdForStatus", () => {
    const response = {
      statuses: [
        { statusId: "id-todo", code: "TODO", label: "To Do", position: 0 },
        {
          statusId: "id-progress",
          code: "IN_PROGRESS",
          label: "In Progress",
          position: 1,
        },
        { statusId: "id-done", code: "COMPLETED", label: "Done", position: 2 },
      ],
    } as TaskBoardResponse;

    it("returns null when response has no statuses", () => {
      expect(getStatusIdForStatus(null, "PENDING")).toBeNull();
    });

    it("returns statusId for PENDING (TODO)", () => {
      expect(getStatusIdForStatus(response, "PENDING")).toBe("id-todo");
    });

    it("returns statusId for IN_PROGRESS and COMPLETED", () => {
      expect(getStatusIdForStatus(response, "IN_PROGRESS")).toBe("id-progress");
      expect(getStatusIdForStatus(response, "COMPLETED")).toBe("id-done");
    });
  });

  describe("getTasksByStatus", () => {
    it("returns empty array when board is null", () => {
      expect(getTasksByStatus(null, "PENDING")).toEqual([]);
    });

    it("returns correct list for each status", () => {
      expect(getTasksByStatus(mockBoard, "PENDING")).toEqual(mockBoard.pending);
      expect(getTasksByStatus(mockBoard, "IN_PROGRESS")).toEqual(
        mockBoard.inProgress
      );
      expect(getTasksByStatus(mockBoard, "COMPLETED")).toEqual(
        mockBoard.completed
      );
    });
  });

  describe("getAllTasks", () => {
    it("returns concatenation of all columns", () => {
      const all = getAllTasks(mockBoard);
      expect(all).toHaveLength(3);
      expect(all.map((t) => t.taskId)).toEqual(["p1", "i1", "c1"]);
    });
  });

  describe("findTask", () => {
    it("returns undefined when board is null", () => {
      expect(findTask(null, "p1")).toBeUndefined();
    });

    it("returns task by taskId", () => {
      expect(findTask(mockBoard, "p1")).toEqual(mockBoard.pending[0]);
      expect(findTask(mockBoard, "missing")).toBeUndefined();
    });
  });

  describe("removeTask", () => {
    it("removes task from correct column", () => {
      const next = removeTask(mockBoard, "i1");
      expect(next.pending).toEqual(mockBoard.pending);
      expect(next.inProgress).toEqual([]);
      expect(next.completed).toEqual(mockBoard.completed);
    });

    it("does not mutate original board", () => {
      removeTask(mockBoard, "p1");
      expect(mockBoard.pending).toHaveLength(1);
    });
  });

  describe("addTaskToStatus", () => {
    it("appends task to PENDING", () => {
      const newTask = mockTask({ taskId: "new", status: "PENDING" });
      const next = addTaskToStatus(mockBoard, "PENDING", newTask);
      expect(next.pending).toHaveLength(2);
      expect(next.pending[1]).toEqual(newTask);
    });

    it("appends task to COMPLETED", () => {
      const newTask = mockTask({ taskId: "new", status: "COMPLETED" });
      const next = addTaskToStatus(mockBoard, "COMPLETED", newTask);
      expect(next.completed).toHaveLength(2);
      expect(next.completed[1]).toEqual(newTask);
    });
  });

  describe("replaceTaskInBoard", () => {
    it("moves task to new status and updates it", () => {
      const updated = mockTask({
        taskId: "p1",
        status: "IN_PROGRESS",
        title: "Updated",
      });
      const next = replaceTaskInBoard(mockBoard, updated);
      expect(next.pending).toHaveLength(0);
      expect(next.inProgress).toHaveLength(2);
      expect(next.inProgress.find((t) => t.taskId === "p1")).toEqual(updated);
    });
  });

  describe("replaceTaskById", () => {
    it("replaces task by oldTaskId and places in new status", () => {
      const newTask = mockTask({
        taskId: "new-id",
        status: "COMPLETED",
        title: "Done",
      });
      const next = replaceTaskById(mockBoard, "p1", newTask);
      expect(next.pending).toHaveLength(0);
      expect(next.completed).toHaveLength(2);
      expect(next.completed.some((t) => t.taskId === "new-id")).toBe(true);
    });
  });

  describe("reorderInStatus", () => {
    it("reorders two tasks within same column", () => {
      const board: TaskBoard = {
        pending: [
          mockTask({ taskId: "a", status: "PENDING" }),
          mockTask({ taskId: "b", status: "PENDING" }),
        ],
        inProgress: [],
        completed: [],
      };
      const next = reorderInStatus(board, "PENDING", "a", "b");
      expect(next.pending[0].taskId).toBe("b");
      expect(next.pending[1].taskId).toBe("a");
    });

    it("returns same board when task not found", () => {
      const next = reorderInStatus(mockBoard, "PENDING", "missing", "p1");
      expect(next).toBe(mockBoard);
    });
  });

  describe("moveTaskToStatus", () => {
    it("moves task to target status", () => {
      const next = moveTaskToStatus(mockBoard, "p1", "COMPLETED");
      expect(next.pending).toHaveLength(0);
      expect(next.completed).toHaveLength(2);
      const moved = next.completed.find((t) => t.taskId === "p1");
      expect(moved?.status).toBe("COMPLETED");
    });

    it("returns same board when task not found", () => {
      const next = moveTaskToStatus(mockBoard, "missing", "COMPLETED");
      expect(next).toEqual(mockBoard);
    });
  });

  describe("createTaskData", () => {
    beforeEach(() => {
      vi.stubGlobal("crypto", {
        randomUUID: () => "generated-uuid",
      });
    });

    it("creates task with required fields and default priority", () => {
      const task = createTaskData("My title", "PENDING");
      expect(task.taskId).toBe("generated-uuid");
      expect(task.title).toBe("My title");
      expect(task.description).toBeNull();
      expect(task.status).toBe("PENDING");
      expect(task.priority).toBe("NORMAL");
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it("accepts description and priority", () => {
      const task = createTaskData("Title", "IN_PROGRESS", "Desc", "HIGH");
      expect(task.description).toBe("Desc");
      expect(task.priority).toBe("HIGH");
    });
  });

  describe("isColumnId", () => {
    it("returns true for PENDING, IN_PROGRESS, COMPLETED", () => {
      expect(isColumnId("PENDING")).toBe(true);
      expect(isColumnId("IN_PROGRESS")).toBe(true);
      expect(isColumnId("COMPLETED")).toBe(true);
    });

    it("returns false for other strings", () => {
      expect(isColumnId("task-123")).toBe(false);
      expect(isColumnId("")).toBe(false);
    });
  });

  describe("TASK_STATUSES", () => {
    it("contains all three statuses", () => {
      expect(TASK_STATUSES).toEqual(["PENDING", "IN_PROGRESS", "COMPLETED"]);
    });
  });
});
