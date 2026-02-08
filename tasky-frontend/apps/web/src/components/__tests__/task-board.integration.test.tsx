import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, within, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { KanbanBoard } from "../task-board";
import type {
  TaskBoardResponse,
  Task,
  BoardStatus,
  BoardColumn,
} from "@tasky/services";

const statusIdTodo = "status-todo";
const statusIdProgress = "status-progress";
const statusIdCompleted = "status-completed";

const mockTask: Task = {
  taskId: "task-1",
  title: "First task",
  description: "Desc",
  status: "PENDING",
  priority: "NORMAL",
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
};

const mockBoardResponse: TaskBoardResponse = {
  boardId: "board-1",
  boardName: "Test board",
  statuses: [
    { statusId: statusIdTodo, code: "TODO", label: "To Do", position: 0 },
    {
      statusId: statusIdProgress,
      code: "IN_PROGRESS",
      label: "In Progress",
      position: 1,
    },
    {
      statusId: statusIdCompleted,
      code: "COMPLETED",
      label: "Complete",
      position: 2,
    },
  ] as BoardStatus[],
  columns: [
    { statusId: statusIdTodo, tasks: [mockTask] },
    { statusId: statusIdProgress, tasks: [] },
    { statusId: statusIdCompleted, tasks: [] },
  ] as BoardColumn[],
};

const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();
const mockMoveMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock("@tasky/services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tasky/services")>();
  return {
    ...actual,
    useTaskBoard: () => ({
      data: mockBoardResponse,
      isLoading: false,
    }),
    useCreateTask: () => ({ mutate: mockCreateMutate }),
    useUpdateTask: () => ({ mutate: mockUpdateMutate }),
    useMoveTask: () => ({ mutate: mockMoveMutate }),
    useDeleteTask: () => ({ mutate: mockDeleteMutate }),
  };
});

describe("KanbanBoard integration", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
    mockCreateMutate.mockClear();
    mockUpdateMutate.mockClear();
    mockMoveMutate.mockClear();
    mockDeleteMutate.mockClear();
  });

  it("calls create task mutation with boardId, title and status when adding a new task in a column", async () => {
    renderWithProviders(<KanbanBoard boardId="board-1" />);
    const addButtons = screen.getAllByTitle("Add task");
    expect(addButtons.length).toBeGreaterThan(0);
    fireEvent.click(addButtons[0]);
    const titleInput = screen.getByPlaceholderText("Card title");
    fireEvent.change(titleInput, { target: { value: "New task title" } });
    const form = titleInput.closest("form");
    expect(form).toBeTruthy();
    if (form) {
      fireEvent.submit(form);
    }
    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledTimes(1);
    });
    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        boardId: "board-1",
        title: "New task title",
        priority: "NORMAL",
      }),
      expect.any(Object)
    );
  });

  it("calls delete task mutation with taskId when user confirms delete on a task card", () => {
    renderWithProviders(<KanbanBoard boardId="board-1" />);
    expect(screen.getByText("First task")).toBeInTheDocument();
    const deleteButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector(".lucide-trash-2"));
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);
    const dialog = screen.getByRole("dialog");
    const confirmBtn = within(dialog).getByRole("button", {
      name: /^delete$/i,
    });
    fireEvent.click(confirmBtn);
    expect(mockDeleteMutate).toHaveBeenCalledWith("task-1", expect.any(Object));
  });

  it("calls update mutation when user edits task title and saves", async () => {
    renderWithProviders(<KanbanBoard boardId="board-1" />);
    const editButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector(".lucide-pencil"));
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);
    expect(screen.getByText("Edit task")).toBeInTheDocument();
    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Updated title" } });
    const saveBtn = screen.getByRole("button", { name: /^save$/i });
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: "task-1",
        title: "Updated title",
      }),
      expect.any(Object)
    );
  });
});
