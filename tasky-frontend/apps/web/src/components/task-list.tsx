import { useState, useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Task, TaskStatus } from "@tasky/services";
import {
  useTaskBoard,
  useMoveTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  queryKeys,
} from "@tasky/services";
import {
  taskBoardResponseToTaskBoard,
  getStatusIdForStatus,
  getTasksByStatus,
} from "@/lib/board-utils";
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
  Skeleton,
  Textarea,
} from "@tasky/ui";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBoardState } from "@/hooks/use-board-state";
import {
  BOARD_COLUMN_CONFIG,
  createTaskData,
  removeTask,
  addTaskToStatus,
  replaceTaskInBoard,
  moveTaskToStatus,
  findTask,
  TASK_STATUSES,
} from "@/lib/board-utils";
import type { TaskEditData } from "./task-card";

const STATUS_BADGE: Record<TaskStatus, string> = {
  PENDING:
    "bg-(--column-pending-bg) text-(--column-pending-text) border-(--column-pending-border)",
  IN_PROGRESS:
    "bg-(--column-progress-bg) text-(--column-progress-text) border-(--column-progress-border)",
  COMPLETED:
    "bg-(--column-completed-bg) text-(--column-completed-text) border-(--column-completed-border)",
};

const SECTION_ACCENT: Record<TaskStatus, string> = {
  PENDING: "border-l-4 border-l-(--column-pending-border)",
  IN_PROGRESS: "border-l-4 border-l-(--column-progress-border)",
  COMPLETED: "border-l-4 border-l-(--column-completed-border)",
};

interface TaskListRowProps {
  readonly task: Task;
  readonly onSaveEdit: (taskId: string, data: TaskEditData) => void;
  readonly onDelete: (taskId: string) => void;
  readonly onStatusChange: (taskId: string, status: TaskStatus) => void;
  readonly animationDelay?: number;
}

function TaskListRow({
  task,
  onSaveEdit,
  onDelete,
  onStatusChange,
  animationDelay = 0,
}: TaskListRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description ?? ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editOpen) {
      setEditTitle(task.title);
      setEditDescription(task.description ?? "");
    }
  }, [editOpen, task.title, task.description]);

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
        });
        setEditOpen(false);
      } finally {
        setSaving(false);
      }
    },
    [editTitle, editDescription, task.taskId, onSaveEdit]
  );

  return (
    <div
      className={`list-item-enter group grid grid-cols-1 items-center gap-2 rounded-xl border border-(--board-card-border) bg-(--board-card) px-3 py-2.5 shadow-sm transition-all duration-200 hover:bg-(--board-card-hover) hover:shadow sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4 ${SECTION_ACCENT[task.status]}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      data-task-id={task.taskId}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-(--foreground)">{task.title}</p>
        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-(--board-add-text)">
            {task.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:contents">
        <Select
          value={task.status}
          onValueChange={(value) =>
            value !== task.status &&
            onStatusChange(task.taskId, value as TaskStatus)
          }
        >
          <SelectTrigger
            className={`h-8 min-w-28 border px-2 py-1 text-xs font-medium ${STATUS_BADGE[task.status]} border-current/30 bg-transparent [&>svg]:ml-0`}
            aria-label="Cambiar estado"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {BOARD_COLUMN_CONFIG[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[10px] text-(--board-add-text)">
          {new Date(task.createdAt).toLocaleDateString("es", {
            day: "2-digit",
            month: "short",
          })}
        </span>
        <div className="flex items-center gap-0.5 sm:justify-end">
          <Popover open={editOpen} onOpenChange={setEditOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="rounded p-1.5 text-(--board-add-text) opacity-0 transition-opacity group-hover:opacity-100 hover:bg-(--board-bar-text)/15 hover:text-(--board-bar-text)"
                title="Editar"
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
              </div>
              <form
                onSubmit={handleSaveEdit}
                className="flex flex-col gap-4 p-4"
              >
                <div className="space-y-2">
                  <Label htmlFor={`list-edit-title-${task.taskId}`}>
                    Título
                  </Label>
                  <Input
                    id={`list-edit-title-${task.taskId}`}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Nombre de la tarea"
                    required
                    maxLength={255}
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`list-edit-desc-${task.taskId}`}>
                    Descripción
                  </Label>
                  <Textarea
                    id={`list-edit-desc-${task.taskId}`}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Opcional..."
                    rows={2}
                    maxLength={500}
                    className="min-h-[64px] resize-none rounded-lg text-sm"
                  />
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
                    className="min-w-[80px] gap-1.5 rounded-lg"
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
                className="rounded p-1.5 text-(--board-add-text) opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                title="Eliminar"
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
              <p className="text-sm font-medium">¿Eliminar esta tarea?</p>
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

interface TaskListProps {
  readonly boardId: string | null;
}

export function TaskList({ boardId }: TaskListProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: boardResponse, isLoading } = useTaskBoard(boardId);
  const serverBoard = useMemo(
    () => taskBoardResponseToTaskBoard(boardResponse),
    [boardResponse]
  );
  const { displayBoard, setBoard, getTasksForStatus } =
    useBoardState(serverBoard);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const moveTask = useMoveTask();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const hasAnyTasks =
    displayBoard &&
    (displayBoard.pending.length > 0 ||
      displayBoard.inProgress.length > 0 ||
      displayBoard.completed.length > 0);

  const handleSaveEdit = useCallback(
    (taskId: string, data: TaskEditData) => {
      const previousTask = findTask(displayBoard, taskId);
      if (!previousTask) return;
      const priority = data.priority ?? previousTask.priority ?? "NORMAL";
      const updatedTask: Task = {
        ...previousTask,
        title: data.title,
        description: data.description ?? null,
        priority,
        updatedAt: new Date().toISOString(),
      };
      setBoard((prev) => (prev ? replaceTaskInBoard(prev, updatedTask) : prev));
      updateTask.mutate(
        {
          taskId,
          title: data.title,
          description: data.description,
          status: previousTask.status,
          priority,
        },
        {
          onSuccess: () => {
            if (boardId) {
              void queryClient.invalidateQueries({
                queryKey: queryKeys.tasks.board(boardId),
              });
            }
          },
          onError: () => {
            setBoard((prev) =>
              prev ? replaceTaskInBoard(prev, previousTask) : prev
            );
            toast.error("Error", "No se pudo guardar");
          },
        }
      );
    },
    [displayBoard, setBoard, updateTask, queryClient, toast, boardId]
  );

  const handleDelete = useCallback(
    (taskId: string) => {
      const snapshot = displayBoard;
      setBoard((prev) => (prev ? removeTask(prev, taskId) : prev));
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          if (boardId) {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.tasks.board(boardId),
            });
          }
        },
        onError: () => {
          if (snapshot) setBoard(snapshot);
          toast.error("Error", "No se pudo eliminar la tarea");
        },
      });
    },
    [displayBoard, setBoard, deleteTask, queryClient, toast, boardId]
  );

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus) => {
      if (!boardId || !boardResponse) return;
      const statusId = getStatusIdForStatus(boardResponse, status);
      if (!statusId) return;
      const targetList = getTasksByStatus(
        displayBoard ?? { pending: [], inProgress: [], completed: [] },
        status
      );
      const position = targetList.length;
      setBoard((prev) =>
        prev ? moveTaskToStatus(prev, taskId, status) : prev
      );
      moveTask.mutate(
        { taskId, statusId, position },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.tasks.board(boardId),
            });
          },
          onError: () => {
            toast.error("Error", "No se pudo cambiar el estado");
          },
        }
      );
    },
    [
      boardId,
      boardResponse,
      displayBoard,
      setBoard,
      moveTask,
      toast,
      queryClient,
    ]
  );

  const handleAddSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const title = newTitle.trim();
      if (!title) return;
      setAddLoading(true);
      const newTask = createTaskData(
        title,
        "PENDING",
        newDescription.trim() || undefined
      );
      setBoard((prev) =>
        prev ? addTaskToStatus(prev, "PENDING", newTask) : prev
      );
      const statusId =
        boardId && boardResponse
          ? getStatusIdForStatus(boardResponse, "PENDING")
          : null;
      createTask.mutate(
        {
          boardId: boardId!,
          statusId: statusId ?? undefined,
          title,
          description: newDescription.trim() || undefined,
          priority: "NORMAL",
        },
        {
          onSuccess: () => {
            setNewTitle("");
            setNewDescription("");
            setIsAdding(false);
            if (boardId) {
              void queryClient.invalidateQueries({
                queryKey: queryKeys.tasks.board(boardId),
              });
            }
          },
          onError: () => {
            setBoard((prev) =>
              prev ? removeTask(prev, newTask.taskId) : prev
            );
            toast.error("Error", "No se pudo crear la tarea");
          },
          onSettled: () => setAddLoading(false),
        }
      );
    },
    [
      newTitle,
      newDescription,
      boardId,
      boardResponse,
      setBoard,
      createTask,
      queryClient,
      toast,
    ]
  );

  if (!boardId) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <p className="text-sm text-(--muted-foreground)">
          Selecciona un tablero
        </p>
      </div>
    );
  }

  if (isLoading && !displayBoard) {
    return (
      <div className="min-h-0 flex-1 space-y-3 p-3 sm:p-4 md:p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 pr-[max(0.75rem,env(safe-area-inset-right))] pb-6 pl-[max(0.75rem,env(safe-area-inset-left))] sm:p-4 sm:pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1rem,env(safe-area-inset-left))] md:p-6 md:pr-[max(1.5rem,env(safe-area-inset-right))] md:pl-[max(1.5rem,env(safe-area-inset-left))]">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {isAdding ? (
          <form
            onSubmit={handleAddSubmit}
            className="list-section-enter rounded-xl border border-(--board-card-border) bg-(--board-card) p-4 shadow-md"
          >
            <div className="space-y-3">
              <Input
                placeholder="Título de la tarea"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={addLoading}
                required
                maxLength={255}
                className="h-10 text-sm"
                autoFocus
              />
              <Textarea
                placeholder="Descripción (opcional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={addLoading}
                rows={2}
                maxLength={500}
                className="min-h-[60px] resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={addLoading || !newTitle.trim()}
                  className="gap-1.5"
                >
                  {addLoading && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  )}
                  Añadir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTitle("");
                    setNewDescription("");
                  }}
                  disabled={addLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="list-section-enter w-full justify-center gap-2 rounded-xl border-2 border-dashed border-(--board-card-border) py-3 text-(--board-add-text) transition-colors hover:border-(--muted-foreground)/50 hover:bg-(--board-card-hover) hover:text-(--foreground)"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Nueva tarea
          </Button>
        )}

        <div className="space-y-8">
          {hasAnyTasks ? (
            <>
              {TASK_STATUSES.map((status, sectionIndex) => {
                const tasksInStatus = getTasksForStatus(status);
                const config = BOARD_COLUMN_CONFIG[status];
                if (tasksInStatus.length === 0) return null;
                return (
                  <section
                    key={status}
                    className="list-section-enter space-y-3"
                    style={{ animationDelay: `${sectionIndex * 80}ms` }}
                  >
                    <header
                      className={`flex items-center gap-2 rounded-xl border border-(--board-card-border) px-4 py-2.5 shadow-sm ${config.bg} ${config.color}`}
                    >
                      <span className="text-lg leading-none" aria-hidden>
                        {config.icon}
                      </span>
                      <h3 className="text-sm font-semibold">{config.label}</h3>
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium opacity-90 ${config.color} bg-black/5 dark:bg-white/10`}
                      >
                        {tasksInStatus.length}
                      </span>
                    </header>
                    <div className="space-y-2">
                      {tasksInStatus.map((task, itemIndex) => (
                        <TaskListRow
                          key={task.taskId}
                          task={task}
                          onSaveEdit={handleSaveEdit}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                          animationDelay={
                            sectionIndex * 80 + 50 + itemIndex * 45
                          }
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          ) : (
            <p className="py-8 text-center text-sm text-(--board-add-text)">
              No hay tareas. Añade una para empezar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
