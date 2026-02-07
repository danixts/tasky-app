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
import type { Task, TaskStatus, TaskPriority } from "@tasky/services";
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
import { useIsMobile } from "@/hooks/use-is-mobile";
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
import type { TaskEditData } from "@/types/task";
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
  const isMobile = useIsMobile();

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
      if (currentTask.status === "COMPLETED") return;

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
      const status = data.status ?? previousTask.status;
      const priority = data.priority ?? previousTask.priority ?? "NORMAL";
      const updatedTask: Task = {
        ...previousTask,
        title: data.title,
        description: data.description ?? null,
        status,
        priority,
        updatedAt: new Date().toISOString(),
      };
      const boardBefore = displayBoard;
      setBoard((prev) => {
        if (!prev) return prev;
        if (status !== previousTask.status) {
          const without = removeTask(prev, taskId);
          return addTaskToStatus(without, status, updatedTask);
        }
        return replaceTaskInBoard(prev, updatedTask);
      });
      updateTask.mutate(
        {
          taskId,
          title: data.title,
          description: data.description,
          status,
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
            setBoard(() => boardBefore ?? null);
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
    [displayBoard, setBoard, deleteTask, queryClient, toast]
  );

  const handleMoveStatus = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      if (!displayBoard || !boardId || !boardResponse) return;
      const currentTask = findTask(displayBoard, taskId);
      if (!currentTask || currentTask.status === newStatus) return;
      const targetStatusId = getStatusIdForStatus(boardResponse, newStatus);
      if (!targetStatusId) return;
      const targetList = getTasksByStatus(displayBoard, newStatus);
      const position = targetList.length;
      const boardBeforeMove = displayBoard;
      setBoard((prev) =>
        prev ? moveTaskToStatus(prev, taskId, newStatus) : prev
      );
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
            toast.error("Error", "No se pudo mover la tarea");
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

  const handleUpdatePriority = useCallback(
    (taskId: string, priority: TaskPriority) => {
      const previousTask = findTask(displayBoard, taskId);
      if (!previousTask) return;
      handleSaveEdit(taskId, {
        title: previousTask.title,
        description: previousTask.description ?? undefined,
        priority,
      });
    },
    [displayBoard, handleSaveEdit]
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
        <p className="text-sm text-(--muted-foreground)">Select a board</p>
      </div>
    );
  }

  if (isLoading && !displayBoard) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-(--border)/60 bg-(--background) px-4 py-4 md:px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32 shrink-0" />
            <Skeleton className="h-2 max-w-sm min-w-[140px] flex-1 rounded-full" />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pr-[max(0.75rem,env(safe-area-inset-right))] pb-6 pl-[max(0.75rem,env(safe-area-inset-left))] sm:pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))] md:pl-[max(1.5rem,env(safe-area-inset-left))]">
          <div className="flex gap-5 px-2 pt-4 pb-6 md:px-4">
            {TASK_STATUSES.map((status) => (
              <div
                key={status}
                className="flex w-72 min-w-[280px] shrink-0 flex-col border-t-4 border-t-(--primary) bg-(--muted)/10"
              >
                <div className="flex items-center gap-2 px-3 py-3.5">
                  <Skeleton className="h-4 w-4 shrink-0 rounded" />
                  <Skeleton className="h-4 max-w-[120px] flex-1 rounded" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
                <div className="flex min-h-[140px] flex-1 flex-col gap-3 p-3">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
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
            {progressPercent}% completed
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
                onMoveStatus={handleMoveStatus}
                onUpdatePriority={handleUpdatePriority}
                isMobile={isMobile}
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
                  onMoveStatus={handleMoveStatus}
                  onUpdatePriority={handleUpdatePriority}
                  isMobile={false}
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
