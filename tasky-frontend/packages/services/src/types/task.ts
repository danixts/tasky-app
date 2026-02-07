export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface Task {
  taskId: string
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface TaskBoard {
  pending: Task[]
  inProgress: Task[]
  completed: Task[]
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status: TaskStatus
}

export interface UpdateTaskRequest {
  title: string
  description?: string
  status: TaskStatus
}

export interface MoveTaskRequest {
  status: TaskStatus
}
