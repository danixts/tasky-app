import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { TaskColumn } from "../task-column";
import type { Task } from "@tasky/services";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { BOARD_COLUMN_CONFIG } from "@/lib/board-utils";

const mockTasks: Task[] = [
  {
    taskId: "col-task-1",
    title: "Column task",
    description: null,
    status: "PENDING",
    priority: "NORMAL",
    createdAt: "2026-01-01T00:00:00",
    updatedAt: "2026-01-01T00:00:00",
  },
];

function renderTaskColumn(
  props: {
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    tasks?: Task[];
    onAddCardSubmit?: (
      status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
      title: string,
      description?: string
    ) => Promise<void>;
    onSaveEdit?: (taskId: string, data: unknown) => void;
    onDelete?: (taskId: string) => void;
  } = {}
) {
  const status = props.status ?? "PENDING";
  const onAddCardSubmit =
    props.onAddCardSubmit ?? vi.fn().mockResolvedValue(undefined);
  const onSaveEdit = props.onSaveEdit ?? vi.fn();
  const onDelete = props.onDelete ?? vi.fn();

  return renderWithProviders(
    <DndContext>
      <SortableContext items={[props.tasks?.[0]?.taskId ?? "col-task-1"]}>
        <TaskColumn
          status={status}
          config={BOARD_COLUMN_CONFIG[status]}
          tasks={props.tasks ?? mockTasks}
          onSaveEdit={onSaveEdit}
          onDelete={onDelete}
          onAddCardSubmit={onAddCardSubmit}
        />
      </SortableContext>
    </DndContext>
  );
}

describe("TaskColumn", () => {
  it("renders column title and task count", () => {
    renderTaskColumn();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders tasks", () => {
    renderTaskColumn();
    expect(screen.getByText("Column task")).toBeInTheDocument();
  });

  it("shows add button when status is not COMPLETED", () => {
    renderTaskColumn({ status: "PENDING" });
    expect(screen.getByTitle("Add task")).toBeInTheDocument();
  });

  it("does not show add button for COMPLETED column", () => {
    renderTaskColumn({
      status: "COMPLETED",
      tasks: [],
    });
    expect(screen.queryByTitle("Add task")).not.toBeInTheDocument();
  });

  it("shows add card form when add button is clicked", () => {
    renderTaskColumn();
    fireEvent.click(screen.getByTitle("Add task"));
    expect(screen.getByPlaceholderText("Card title")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Description (optional)")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^add$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onAddCardSubmit when add form is submitted", async () => {
    const onAddCardSubmit = vi.fn().mockResolvedValue(undefined);
    renderTaskColumn({ onAddCardSubmit });

    fireEvent.click(screen.getByTitle("Add task"));
    fireEvent.change(screen.getByPlaceholderText("Card title"), {
      target: { value: "New card" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAddCardSubmit).toHaveBeenCalledWith(
      "PENDING",
      "New card",
      undefined
    );
  });

  it("calls onAddCardSubmit with description when provided", async () => {
    const onAddCardSubmit = vi.fn().mockResolvedValue(undefined);
    renderTaskColumn({ onAddCardSubmit });

    fireEvent.click(screen.getByTitle("Add task"));
    fireEvent.change(screen.getByPlaceholderText("Card title"), {
      target: { value: "New card" },
    });
    fireEvent.change(screen.getByPlaceholderText("Description (optional)"), {
      target: { value: "Optional desc" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAddCardSubmit).toHaveBeenCalledWith(
      "PENDING",
      "New card",
      "Optional desc"
    );
  });

  it("Cancel hides the add form", () => {
    renderTaskColumn();
    fireEvent.click(screen.getByTitle("Add task"));
    expect(screen.getByPlaceholderText("Card title")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByPlaceholderText("Card title")).not.toBeInTheDocument();
  });
});
