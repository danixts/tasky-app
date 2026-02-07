import { useEffect, useRef, useState, useCallback } from "react";
import type { Task, TaskStatus, TaskBoard } from "@tasky/services";
import { getTasksByStatus } from "@/lib/board-utils";

export function useBoardState(serverBoard: TaskBoard | null | undefined) {
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const lastSyncedRef = useRef<TaskBoard | null | undefined>(undefined);

  useEffect(() => {
    if (serverBoard && serverBoard !== lastSyncedRef.current) {
      lastSyncedRef.current = serverBoard;
      setBoard(serverBoard);
    } else if (!serverBoard && lastSyncedRef.current !== undefined) {
      lastSyncedRef.current = serverBoard;
      setBoard(null);
    }
  }, [serverBoard]);

  const displayBoard = board ?? serverBoard ?? null;

  const getTasksForStatus = useCallback(
    (status: TaskStatus): Task[] => {
      return getTasksByStatus(displayBoard, status);
    },
    [displayBoard]
  );

  return { board, setBoard, displayBoard, getTasksForStatus };
}
