import { useState, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@tasky/services";
import { Button, Input, Textarea } from "@tasky/ui";
import { cn } from "@tasky/ui/lib/utils";
import { TaskCard, type TaskEditData } from "./task-card";
import { ListTodo, Loader2, CheckCircle2, Plus } from "lucide-react";

const COLUMN_ACCENT: Record<TaskStatus, string> = {
  PENDING: "border-t-4 border-t-(--primary)",
  IN_PROGRESS: "border-t-4 border-t-(--primary)",
  COMPLETED: "border-t-4 border-t-(--primary)",
};

const COLUMN_ICONS: Record<TaskStatus, typeof ListTodo> = {
  PENDING: ListTodo,
  IN_PROGRESS: Loader2,
  COMPLETED: CheckCircle2,
};

interface ColumnConfig {
  label: string;
  color: string;
  bg: string;
  icon: string;
}

interface TaskColumnProps {
  readonly status: TaskStatus;
  readonly config: ColumnConfig;
  readonly tasks: Task[];
  readonly onSaveEdit: (taskId: string, data: TaskEditData) => void;
  readonly onDelete: (taskId: string) => void;
  readonly onAddCardSubmit: (
    status: TaskStatus,
    title: string,
    description?: string
  ) => Promise<void>;
}

export function TaskColumn({
  status,
  config,
  tasks,
  onSaveEdit,
  onDelete,
  onAddCardSubmit,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const t = title.trim();
      if (!t) return;
      setLoading(true);
      try {
        await onAddCardSubmit(status, t, description.trim() || undefined);
        setTitle("");
        setDescription("");
        setIsAdding(false);
      } finally {
        setLoading(false);
      }
    },
    [status, title, description, onAddCardSubmit]
  );

  const handleCancel = useCallback(() => {
    setTitle("");
    setDescription("");
    setIsAdding(false);
  }, []);

  const ColumnIcon = COLUMN_ICONS[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 min-w-[280px] shrink-0 flex-col pt-0 transition-all duration-200",
        "bg-(--muted)/10",
        COLUMN_ACCENT[status],
        isOver &&
          "scale-[1.01] ring-2 ring-(--ring) ring-offset-2 ring-offset-(--background)"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3.5">
        <ColumnIcon className={cn("h-4 w-4 shrink-0", config.color)} />
        <h3
          className={cn("min-w-0 flex-1 text-sm font-semibold", config.color)}
        >
          {config.label}
        </h3>
        <span className="rounded-full bg-(--muted) px-2 py-0.5 text-xs font-medium text-(--foreground)">
          {tasks.length}
        </span>
        {status !== "COMPLETED" && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--accent) hover:text-(--accent-foreground)"
            title="Add task"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex min-h-[140px] flex-1 flex-col gap-3 p-3">
        <SortableContext
          items={tasks.map((t) => t.taskId)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        {status !== "COMPLETED" &&
          (isAdding ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 rounded-lg bg-(--card) p-3 shadow-sm"
            >
              <Input
                placeholder="Card title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
                maxLength={255}
                className="h-9 text-sm"
                autoFocus
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={2}
                maxLength={500}
                className="min-h-[60px] resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !title.trim()}
                  className="flex-1"
                >
                  Add
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="w-full justify-center gap-2 rounded-lg border border-dashed border-(--border)/80 py-2.5 text-xs font-medium text-(--muted-foreground) hover:bg-(--accent)/50 hover:text-(--accent-foreground)"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              Add Task
            </Button>
          ))}
      </div>
    </div>
  );
}
