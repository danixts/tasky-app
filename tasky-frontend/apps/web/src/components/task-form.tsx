import { useState, useEffect, useRef } from "react";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@tasky/services";
import {
  Button,
  Input,
  Label,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Textarea,
} from "@tasky/ui";
import { Loader2 } from "lucide-react";

export type TaskFormSubmitPayload =
  | (CreateTaskRequest & { taskId?: string })
  | (UpdateTaskRequest & { taskId: string });

interface TaskFormProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly task?: Task | null;
  readonly boardId?: string;
  readonly statusId?: string;
  readonly onSubmit: (data: TaskFormSubmitPayload) => Promise<void>;
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  boardId,
  statusId,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("PENDING");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");
  const [loading, setLoading] = useState(false);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setStatus(task.status);
        setPriority(task.priority ?? "NORMAL");
      } else {
        setTitle("");
        setDescription("");
        setStatus("PENDING");
        setPriority("NORMAL");
      }
    }
    prevOpenRef.current = open;
  }, [open, task]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!task && !boardId) return;
    setLoading(true);
    try {
      if (task) {
        await onSubmit({
          taskId: task.taskId,
          title,
          description: description || undefined,
          status,
          priority,
        });
      } else {
        await onSubmit({
          boardId: boardId!,
          statusId,
          title,
          description: description || undefined,
          priority,
        });
      }
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <span
          className="fixed top-1/2 left-1/2 z-0 h-0 w-0 shrink-0"
          aria-hidden
        />
      </PopoverAnchor>
      <PopoverContent
        className="z-[100] w-full max-w-lg p-0"
        align="center"
        side="top"
        sideOffset={0}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-4">
          <h3 className="text-lg leading-none font-semibold">
            {task ? "Edit Task" : "New Task"}
          </h3>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            {task
              ? "Update the task details"
              : "Fill in the fields to create a task"}
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border-t border-(--border) px-4 pt-2 pb-4"
        >
          <div className="space-y-2">
            <Label htmlFor="task-form-title">Title</Label>
            <Input
              id="task-form-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-form-description">Description</Label>
            <Textarea
              id="task-form-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-form-status">Status</Label>
            <select
              id="task-form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="flex h-9 w-full rounded-md border border-(--input) bg-(--background) px-3 py-1 text-sm text-(--foreground) shadow-sm focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:outline-none"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-form-priority">Prioridad</Label>
            <select
              id="task-form-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="flex h-9 w-full rounded-md border border-(--input) bg-(--background) px-3 py-1 text-sm text-(--foreground) shadow-sm focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:outline-none"
            >
              <option value="LOW">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {task ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
