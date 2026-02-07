export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type TaskPriority = "LOW" | "NORMAL" | "HIGH";

export interface Task {
  taskId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  boardId?: string;
  statusId?: string;
  position?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskBoard {
  pending: Task[];
  inProgress: Task[];
  completed: Task[];
}

export interface Board {
  boardId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardRequest {
  name: string;
}

export interface BoardStatus {
  statusId: string;
  code: string;
  label: string;
  position: number;
}

export interface BoardColumn {
  statusId: string;
  tasks: Task[];
}

export interface TaskBoardResponse {
  boardId: string;
  boardName: string;
  statuses: BoardStatus[];
  columns: BoardColumn[];
}

export interface CreateTaskRequest {
  boardId: string;
  statusId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  statusId?: string;
}

export interface MoveTaskRequest {
  statusId: string;
  position: number;
}
