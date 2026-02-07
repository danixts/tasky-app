import { useState, useEffect, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskPriority } from "@tasky/services";
import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@tasky/ui";
import { cn } from "@tasky/ui/lib/utils";
import {
  Check,
  GripVertical,
  Loader2,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";

const PRIORITY_GRADIENT: Record<TaskPriority, string> = {
  LOW: "bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700",
  NORMAL:
    "bg-gradient-to-r from-sky-400 to-sky-600 dark:from-sky-500 dark:to-sky-700",
  HIGH: "bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
};

const PRIORITY_SELECT_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
];

function getRelativeDate(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dateOnly.getTime() === today.getTime()) return "Today";
  if (dateOnly.getTime() === yesterday.getTime()) return "Yesterday";
  const diffDays = Math.floor(
    (today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en", { day: "2-digit", month: "short" });
}

export interface TaskEditData {
  readonly title: string;
  readonly description?: string;
  readonly priority?: TaskPriority;
}

interface TaskCardProps {
  readonly task: Task;
  readonly onSaveEdit: (taskId: string, data: TaskEditData) => void;
  readonly onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onSaveEdit, onDelete }: TaskCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description ?? ""
  );
  const [editPriority, setEditPriority] = useState<TaskPriority>(
    task.priority ?? "NORMAL"
  );
  const [saving, setSaving] = useState(false);
  const isCompleted = task.status === "COMPLETED";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.taskId,
    data: { task },
    disabled: isCompleted,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (editOpen) {
      setEditTitle(task.title);
      setEditDescription(task.description ?? "");
      setEditPriority(task.priority ?? "NORMAL");
    }
  }, [editOpen, task.title, task.description, task.priority]);

  const handleConfirmDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDelete(task.taskId);
      setDeleteOpen(false);
    },
    [onDelete, task.taskId]
  );

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const title = editTitle.trim();
      if (!title) return;
      setSaving(true);
      try {
        onSaveEdit(task.taskId, {
          title,
          description: editDescription.trim() || undefined,
          priority: editPriority,
        });
        setEditOpen(false);
      } finally {
        setSaving(false);
      }
    },
    [editTitle, editDescription, editPriority, task.taskId, onSaveEdit]
  );

  const priorityKey = task.priority ?? "NORMAL";
  const priorityGradient = PRIORITY_GRADIENT[priorityKey];
  const relativeDate = getRelativeDate(task.createdAt);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl bg-gradient-to-br from-(--card)/80 via-(--card)/80 to-(--muted)/20 p-3 text-sm shadow-sm backdrop-blur-md transition-all duration-200 ${isCompleted ? "cursor-default" : "cursor-grab active:cursor-grabbing"} ${
        isDragging
          ? "z-50 rotate-2 opacity-95 shadow-lg ring-2 ring-(--ring)"
          : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-2">
        {!isCompleted && (
          <div
            className="mt-1 shrink-0 cursor-grab text-(--muted-foreground) opacity-0 group-hover:opacity-100"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {isCompleted ? (
            <h4 className="leading-snug font-semibold text-(--foreground)">
              {task.title}
            </h4>
          ) : (
            <button
              type="button"
              className="w-full cursor-pointer text-left"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditOpen(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <h4 className="leading-snug font-semibold text-(--foreground)">
                {task.title}
              </h4>
            </button>
          )}
          {task.description?.trim() ? (
            <p className="mt-1 line-clamp-2 text-xs text-(--muted-foreground)">
              {task.description}
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-2 text-xs text-(--muted-foreground)">
            {isCompleted ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Clock className="h-3.5 w-3.5 shrink-0" />
            )}
            {relativeDate}
            <span
              className={cn(
                "ml-auto flex h-4 shrink-0 items-center rounded-full px-2.5",
                priorityGradient
              )}
              aria-label={`Priority ${priorityKey.toLowerCase()}`}
            >
              <span className="text-[10px] leading-none font-medium text-white/95">
                {PRIORITY_LABEL[priorityKey]}
              </span>
            </span>
          </div>
        </div>
        {!isCompleted && (
          <div
            className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Popover open={editOpen} onOpenChange={setEditOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                  className="rounded p-1.5 text-(--muted-foreground) hover:bg-(--accent) hover:text-(--accent-foreground)"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="z-50 w-80 overflow-hidden rounded-xl border-(--border) bg-(--popover) p-0 shadow-xl"
                align="end"
                side="left"
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="bg-(--muted)/50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-(--foreground)">
                    Edit task
                  </h3>
                  <p className="mt-0.5 text-xs text-(--muted-foreground)">
                    Change the title and description if you like.
                  </p>
                </div>
                <form
                  onSubmit={handleSaveEdit}
                  className="flex flex-col gap-4 p-4"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor={`edit-title-${task.taskId}`}
                      className="text-sm font-medium text-(--foreground)"
                    >
                      Title
                    </Label>
                    <Input
                      id={`edit-title-${task.taskId}`}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Task name"
                      required
                      maxLength={255}
                      className="h-10 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor={`edit-desc-${task.taskId}`}
                      className="text-sm font-medium text-(--foreground)"
                    >
                      Description
                    </Label>
                    <Textarea
                      id={`edit-desc-${task.taskId}`}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Optional..."
                      rows={2}
                      maxLength={500}
                      className="min-h-[64px] resize-none rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor={`edit-priority-${task.taskId}`}
                      className="text-sm font-medium text-(--foreground)"
                    >
                      Priority
                    </Label>
                    <select
                      id={`edit-priority-${task.taskId}`}
                      value={editPriority}
                      onChange={(e) =>
                        setEditPriority(e.target.value as TaskPriority)
                      }
                      className={cn(
                        "flex h-10 w-full items-center justify-between rounded-lg border border-(--input) bg-(--background) px-3 py-2 text-sm text-(--foreground) shadow-sm transition-colors outline-none focus:ring-2 focus:ring-(--ring) disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      {PRIORITY_SELECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-w-[80px] rounded-lg"
                      onClick={() => setEditOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="min-w-[80px] gap-1.5 rounded-lg bg-(--primary) text-(--primary-foreground) hover:bg-(--primary)/90"
                      disabled={saving || !editTitle.trim()}
                    >
                      {saving && (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      )}
                      Save
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
            <Popover open={deleteOpen} onOpenChange={setDeleteOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                  className="rounded p-1.5 text-(--muted-foreground) hover:bg-red-500/20 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-56 bg-(--popover) p-3 shadow-lg"
                align="end"
                sideOffset={6}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <p className="text-sm font-medium">
                  Are you sure you want to delete?
                </p>
                <p className="mt-1 text-xs text-(--muted-foreground)">
                  This action cannot be undone.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeleteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="flex-1 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
                    onClick={handleConfirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
}
