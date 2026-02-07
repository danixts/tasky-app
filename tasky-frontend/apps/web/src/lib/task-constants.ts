import type { TaskPriority, TaskStatus } from "@tasky/services";

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
];

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "PENDING", label: "To Do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
};

export const TASK_PRIORITY_GRADIENT: Record<TaskPriority, string> = {
  LOW: "bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700",
  NORMAL:
    "bg-gradient-to-r from-sky-400 to-sky-600 dark:from-sky-500 dark:to-sky-700",
  HIGH: "bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700",
};
