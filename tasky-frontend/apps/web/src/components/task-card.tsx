import { useState, useEffect, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskStatus, TaskPriority } from "@tasky/services";
import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@tasky/ui";
import {
  GripVertical,
  Loader2,
  Pencil,
  Trash2,
  Clock,
  Check,
} from "lucide-react";

const CARD_STATUS_BORDER: Record<TaskStatus, string> = {
  PENDING: "border-t-4 border-t-(--column-pending-border)",
  IN_PROGRESS: "border-t-4 border-t-(--column-progress-border)",
  COMPLETED: "border-t-4 border-t-(--column-completed-border)",
};

const PRIORITY_PILL: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  LOW: {
    label: "Baja",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  NORMAL: {
    label: "Normal",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  HIGH: {
    label: "Alta",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
};

const PRIORITY_OPTIONS: TaskPriority[] = ["LOW", "NORMAL", "HIGH"];

function getRelativeDate(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dateOnly.getTime() === today.getTime()) return "Hoy";
  if (dateOnly.getTime() === yesterday.getTime()) return "Ayer";
  const diffDays = Math.floor(
    (today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return d.toLocaleDateString("es", { day: "2-digit", month: "short" });
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
  const priority = PRIORITY_PILL[priorityKey];
  const relativeDate = getRelativeDate(task.createdAt);
  const isCompleted = task.status === "COMPLETED";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative cursor-grab bg-(--card) p-3 text-sm shadow-sm transition-all duration-200 active:cursor-grabbing ${CARD_STATUS_BORDER[task.status]} ${
        isDragging
          ? "z-50 rotate-2 opacity-95 shadow-lg ring-2 ring-(--ring)"
          : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className="mt-1 shrink-0 cursor-grab text-(--muted-foreground) opacity-0 group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priority.className}`}
            >
              {priority.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-(--muted-foreground)">
              {isCompleted ? (
                <Check className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {relativeDate}
            </span>
          </div>
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
          {task.description?.trim() ? (
            <p className="mt-1 line-clamp-2 text-xs text-(--muted-foreground)">
              {task.description}
            </p>
          ) : null}
        </div>
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
                  Editar tarea
                </h3>
                <p className="mt-0.5 text-xs text-(--muted-foreground)">
                  Cambia el título y la descripción si quieres.
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
                    Título
                  </Label>
                  <Input
                    id={`edit-title-${task.taskId}`}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Nombre de la tarea"
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
                    Descripción
                  </Label>
                  <Textarea
                    id={`edit-desc-${task.taskId}`}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Opcional..."
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
                    Prioridad
                  </Label>
                  <Select
                    value={editPriority}
                    onValueChange={(v) => setEditPriority(v as TaskPriority)}
                  >
                    <SelectTrigger
                      id={`edit-priority-${task.taskId}`}
                      className="h-10 rounded-lg"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PRIORITY_PILL[p].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-w-[80px] rounded-lg"
                    onClick={() => setEditOpen(false)}
                  >
                    Cancelar
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
                    Guardar
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
              <p className="text-sm font-medium">¿Estás seguro de eliminar?</p>
              <p className="mt-1 text-xs text-(--muted-foreground)">
                Esta acción no se puede deshacer.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={handleConfirmDelete}
                >
                  Eliminar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
