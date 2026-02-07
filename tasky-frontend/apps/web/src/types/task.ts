import type { TaskPriority, TaskStatus } from "@tasky/services";

export interface TaskEditData {
  readonly title: string;
  readonly description?: string;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
}
