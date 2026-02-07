import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { TaskCard } from "../task-card";
import type { Task } from "@tasky/services";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

const mockTask: Task = {
  taskId: "123",
  title: "Test task",
  description: "Task description",
  status: "PENDING",
  priority: "NORMAL",
  createdAt: "2026-02-06T12:00:00",
  updatedAt: "2026-02-06T12:00:00",
};

function renderTaskCard(task = mockTask) {
  const onSaveEdit = vi.fn();
  const onDelete = vi.fn();

  const result = renderWithProviders(
    <DndContext>
      <SortableContext items={[task.taskId]}>
        <TaskCard task={task} onSaveEdit={onSaveEdit} onDelete={onDelete} />
      </SortableContext>
    </DndContext>
  );

  return { ...result, onSaveEdit, onDelete };
}

describe("TaskCard", () => {
  it("renders task title and description", () => {
    renderTaskCard();
    expect(screen.getByText("Test task")).toBeInTheDocument();
    expect(screen.getByText("Task description")).toBeInTheDocument();
  });

  it("renders creation date", () => {
    renderTaskCard();
    const dateText = screen.getByText(
      /today|yesterday|\d+ days ago|\d{2} \w{3}/i
    );
    expect(dateText).toBeInTheDocument();
  });

  it("renders task without description", () => {
    renderTaskCard({ ...mockTask, description: null });
    expect(screen.getByText("Test task")).toBeInTheDocument();
    expect(screen.queryByText("Task description")).not.toBeInTheDocument();
  });

  it("calls onDelete when delete is confirmed in popover", () => {
    const { onDelete } = renderTaskCard();
    const deleteButtons = screen.getAllByRole("button");
    const deleteBtn = deleteButtons.find((btn) =>
      btn.querySelector(".lucide-trash-2")
    );
    if (deleteBtn) fireEvent.click(deleteBtn);
    const confirmBtn = screen.getByRole("button", { name: /^delete$/i });
    fireEvent.click(confirmBtn);
    expect(onDelete).toHaveBeenCalledWith("123");
  });

  it("opens edit popover when edit is clicked and calls onSaveEdit on save", async () => {
    const { onSaveEdit } = renderTaskCard();
    const editButtons = screen.getAllByRole("button");
    const editBtn = editButtons.find((btn) =>
      btn.querySelector(".lucide-pencil")
    );
    if (editBtn) fireEvent.click(editBtn);
    expect(screen.getByText("Edit task")).toBeInTheDocument();
    const saveBtn = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveBtn);
    expect(onSaveEdit).toHaveBeenCalledWith("123", {
      title: "Test task",
      description: "Task description",
      priority: "NORMAL",
    });
  });
});
