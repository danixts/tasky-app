import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { TaskForm } from "../task-form";
import type { Task } from "@tasky/services";

const mockTask: Task = {
  taskId: "456",
  title: "Existing task",
  description: "Existing description",
  status: "IN_PROGRESS",
  priority: "NORMAL",
  createdAt: "2026-02-06T12:00:00",
  updatedAt: "2026-02-06T12:00:00",
};

describe("TaskForm", () => {
  it("renders create form when no task provided", () => {
    renderWithProviders(
      <TaskForm
        open={true}
        onOpenChange={() => {}}
        boardId="board-1"
        onSubmit={async () => {}}
      />
    );
    expect(screen.getByText("New Task")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("renders edit form when task provided", () => {
    renderWithProviders(
      <TaskForm
        open={true}
        onOpenChange={() => {}}
        task={mockTask}
        onSubmit={async () => {}}
      />
    );
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing task")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Existing description")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("calls onSubmit with form data for new task", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <TaskForm
        open={true}
        onOpenChange={() => {}}
        boardId="board-1"
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New task" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Desc" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        boardId: "board-1",
        statusId: undefined,
        title: "New task",
        description: "Desc",
        priority: "NORMAL",
      });
    });
  });

  it("calls onSubmit with taskId for edit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <TaskForm
        open={true}
        onOpenChange={() => {}}
        task={mockTask}
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: "456",
          title: "Updated",
        })
      );
    });
  });

  it("does not render when closed", () => {
    renderWithProviders(
      <TaskForm
        open={false}
        onOpenChange={() => {}}
        boardId="board-1"
        onSubmit={async () => {}}
      />
    );
    expect(screen.queryByText("New Task")).not.toBeInTheDocument();
  });
});
