import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "@tasky/services";
import {
  useTaskBoard,
  useMoveTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  queryKeys,
} from "@tasky/services";
import { Skeleton } from "@tasky/ui";
import { useToast } from "@/hooks/use-toast";
import { useBoardState } from "@/hooks/use-board-state";
import {
  TASK_STATUSES,
  BOARD_COLUMN_CONFIG,
  taskBoardResponseToTaskBoard,
  getStatusIdForStatus,
  findTask,
  removeTask,
  addTaskToStatus,
  replaceTaskInBoard,
  replaceTaskById,
  reorderInStatus,
  moveTaskToStatus,
  createTaskData,
  isColumnId,
  getAllTasks,
  getTasksByStatus,
} from "@/lib/board-utils";
import type { TaskEditData } from "./task-card";
import { TaskColumn } from "./task-column";
import { TaskCard } from "./task-card";

interface TaskBoardComponentProps {
  readonly boardId: string | null;
  readonly openNewTask?: boolean;
  readonly onOpenNewTaskConsumed?: () => void;
}

function TaskBoardComponent({
  boardId,
  openNewTask,
  onOpenNewTaskConsumed,
}: TaskBoardComponentProps) {
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

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (openNewTask && onOpenNewTaskConsumed) {
      onOpenNewTaskConsumed();
    }
  }, [openNewTask, onOpenNewTaskConsumed]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 12 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    setActiveTask(task ?? null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over || !displayBoard || !boardId || !boardResponse) return;

      const taskId = active.id as string;
      const overId = over.id as string;
      if (overId === taskId) return;

      const currentTask = findTask(displayBoard, taskId);
      if (!currentTask) return;

      const targetStatus: TaskStatus = isColumnId(overId)
        ? overId
        : (findTask(displayBoard, overId)?.status ?? currentTask.status);

      const targetStatusId = getStatusIdForStatus(boardResponse, targetStatus);
      if (!targetStatusId) return;

      const isReorder =
        !isColumnId(overId) && currentTask.status === targetStatus;

      let position: number;
      if (isReorder) {
        const list = getTasksByStatus(displayBoard, targetStatus);
        const toIdx = list.findIndex((t) => t.taskId === overId);
        if (toIdx === -1) return;
        position = toIdx;
        setBoard((prev) =>
          prev ? reorderInStatus(prev, targetStatus, taskId, overId) : prev
        );
      } else {
        if (currentTask.status === targetStatus) return;
        const targetList = getTasksByStatus(displayBoard, targetStatus);
        position = targetList.length;
        setBoard((prev) =>
          prev ? moveTaskToStatus(prev, taskId, targetStatus) : prev
        );
      }

      const boardBeforeMove = displayBoard;
      moveTask.mutate(
        { taskId, statusId: targetStatusId, position },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.tasks.board(boardId),
            });
          },
          onError: () => {
            setBoard(() => boardBeforeMove);
            toast.error("Move failed", "Could not move the task");
          },
        }
      );
    },
    [
      displayBoard,
      setBoard,
      moveTask,
      toast,
      boardId,
      boardResponse,
      queryClient,
    ]
  );

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
            toast.error("Error", "Could not save");
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
          void queryClient.invalidateQueries({
            queryKey: queryKeys.tasks.board(),
          });
        },
        onError: () => {
          if (snapshot) setBoard(snapshot);
          toast.error("Error", "Could not delete the task");
        },
      });
    },
    [displayBoard, setBoard, deleteTask, queryClient, toast, boardId]
  );

  const handleAddCardSubmit = useCallback(
    (columnStatus: TaskStatus, title: string, description?: string) => {
      if (!boardId || !boardResponse) return Promise.resolve();
      const statusId = getStatusIdForStatus(boardResponse, columnStatus);
      const newTask = createTaskData(title, columnStatus, description);
      setBoard((prev) =>
        prev ? addTaskToStatus(prev, columnStatus, newTask) : prev
      );
      createTask.mutate(
        {
          boardId,
          statusId: statusId ?? undefined,
          title,
          description,
          priority: "NORMAL",
        },
        {
          onSuccess: (createdTask) => {
            setBoard((prev) =>
              prev ? replaceTaskById(prev, newTask.taskId, createdTask) : prev
            );
            void queryClient.invalidateQueries({
              queryKey: queryKeys.tasks.board(boardId),
            });
          },
          onError: () => {
            setBoard((prev) =>
              prev ? removeTask(prev, newTask.taskId) : prev
            );
            toast.error("Error", "Could not create the task");
          },
        }
      );
      return Promise.resolve();
    },
    [boardId, boardResponse, setBoard, createTask, queryClient, toast]
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
      <div className="min-h-0 flex-1 p-3 sm:p-4 md:p-6">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <Skeleton className="h-7 w-28 sm:h-8 sm:w-32" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {TASK_STATUSES.map((col) => (
            <div key={col} className="flex w-72 shrink-0 flex-col gap-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const allTasks = displayBoard ? getAllTasks(displayBoard) : [];
  const completedCount = displayBoard ? displayBoard.completed.length : 0;
  const progressPercent =
    allTasks.length > 0
      ? Math.round((completedCount / allTasks.length) * 100)
      : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-(--border)/60 bg-(--background) px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-(--foreground)">
            {progressPercent}% actividad completada
          </span>
          <div className="h-2 max-w-sm min-w-[140px] flex-1 overflow-hidden rounded-full bg-(--muted)">
            <div
              className="progress-bar-fill h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain bg-(--muted)/25 pr-[max(0.75rem,env(safe-area-inset-right))] pb-6 pl-[max(0.75rem,env(safe-area-inset-left))] [-webkit-overflow-scrolling:touch] sm:pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))] md:pl-[max(1.5rem,env(safe-area-inset-left))]">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 px-2 pt-4 pb-6 md:px-4">
            {TASK_STATUSES.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                config={BOARD_COLUMN_CONFIG[status]}
                tasks={getTasksForStatus(status)}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDelete}
                onAddCardSubmit={handleAddCardSubmit}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="w-72 shrink-0 rotate-2 cursor-grabbing opacity-95 shadow-xl">
                <TaskCard
                  task={activeTask}
                  onSaveEdit={handleSaveEdit}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

export const KanbanBoard = memo(TaskBoardComponent);
