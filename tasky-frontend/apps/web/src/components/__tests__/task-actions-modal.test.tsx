import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { TaskActionsModal } from "../task-actions-modal";
import type { Task } from "@tasky/services";

const mockTask: Task = {
  taskId: "modal-task-1",
  title: "Modal task",
  description: "Some description",
  status: "PENDING",
  priority: "HIGH",
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
};

function renderModal(
  props: {
    task?: Task | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSaveEdit?: (taskId: string, data: unknown) => void;
    onDelete?: (taskId: string) => void;
  } = {}
) {
  const onOpenChange = props.onOpenChange ?? vi.fn();
  const onSaveEdit = props.onSaveEdit ?? vi.fn();
  const onDelete = props.onDelete ?? vi.fn();

  const result = renderWithProviders(
    <TaskActionsModal
      task={props.task ?? mockTask}
      open={props.open ?? true}
      onOpenChange={onOpenChange}
      onSaveEdit={onSaveEdit}
      onDelete={onDelete}
      onMoveStatus={vi.fn()}
      onUpdatePriority={vi.fn()}
    />
  );

  return { ...result, onOpenChange, onSaveEdit, onDelete };
}

describe("TaskActionsModal", () => {
  it("renders nothing when task is null", () => {
    const { container } = renderModal({ task: null, open: true });
    expect(container.firstChild).toBeNull();
  });

  it("renders edit form when open with task", () => {
    renderModal();
    expect(screen.getByText("Edit task")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Modal task");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Some description"
    );
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete task/i })
    ).toBeInTheDocument();
  });

  it("calls onSaveEdit with form data on save", () => {
    const onSaveEdit = vi.fn();
    renderModal({ onSaveEdit });

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated title" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Updated desc" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSaveEdit).toHaveBeenCalledWith("modal-task-1", {
      title: "Updated title",
      description: "Updated desc",
      status: "PENDING",
      priority: "HIGH",
    });
  });

  it("calls onOpenChange(false) after save", () => {
    const onOpenChange = vi.fn();
    renderModal({ onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onDelete and onOpenChange(false) when delete button is clicked", () => {
    const onDelete = vi.fn();
    const onOpenChange = vi.fn();
    renderModal({ onDelete, onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: /delete task/i }));

    expect(onDelete).toHaveBeenCalledWith("modal-task-1");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChange(false) when Cancel is clicked", () => {
    const onOpenChange = vi.fn();
    renderModal({ onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("includes status and priority in save payload when changed", () => {
    const onSaveEdit = vi.fn();
    renderModal({ onSaveEdit });

    const statusSelect = screen.getByLabelText("Status");
    const prioritySelect = screen.getByLabelText("Priority");
    fireEvent.change(statusSelect, { target: { value: "COMPLETED" } });
    fireEvent.change(prioritySelect, { target: { value: "LOW" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSaveEdit).toHaveBeenCalledWith(
      "modal-task-1",
      expect.objectContaining({
        status: "COMPLETED",
        priority: "LOW",
      })
    );
  });
});
