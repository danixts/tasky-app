import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import type { ApiResponse } from '../api/client'
import type {
  Task,
  TaskStatus,
  TaskBoard,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
} from '../types/task'
import { queryKeys } from '../query-keys'

export function useTasks(status?: TaskStatus) {
  return useQuery({
    queryKey: queryKeys.tasks.list(status),
    queryFn: async () => {
      const params = status ? { status } : {}
      const { data } = await apiClient.get<ApiResponse<Task[]>>('/api/v1/tasks', { params })
      return data.data
    },
  })
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Task>>(`/api/v1/tasks/${taskId}`)
      return data.data
    },
    enabled: !!taskId,
  })
}

export function useTaskBoard() {
  return useQuery({
    queryKey: queryKeys.tasks.board(),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<TaskBoard>>('/api/v1/tasks/board')
      return data.data
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (task: CreateTaskRequest) => {
      const { data } = await apiClient.post<ApiResponse<Task>>('/api/v1/tasks', task)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, ...task }: UpdateTaskRequest & { taskId: string }) => {
      const { data } = await apiClient.put<ApiResponse<Task>>(`/api/v1/tasks/${taskId}`, task)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() })
    },
  })
}

export function useMoveTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, status }: MoveTaskRequest & { taskId: string }) => {
      const { data } = await apiClient.patch<ApiResponse<Task>>(`/api/v1/tasks/${taskId}/move`, {
        status,
      })
      return data.data
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.board() })
      const previousBoard = queryClient.getQueryData<TaskBoard>(queryKeys.tasks.board())

      if (previousBoard) {
        const allTasks = [
          ...previousBoard.pending,
          ...previousBoard.inProgress,
          ...previousBoard.completed,
        ]
        const task = allTasks.find((t) => t.taskId === taskId)
        if (task) {
          const removeFromColumn = (tasks: Task[]) => tasks.filter((t) => t.taskId !== taskId)
          const updatedTask = { ...task, status }
          const newBoard: TaskBoard = {
            pending: removeFromColumn(previousBoard.pending),
            inProgress: removeFromColumn(previousBoard.inProgress),
            completed: removeFromColumn(previousBoard.completed),
          }
          if (status === 'PENDING') newBoard.pending.push(updatedTask)
          else if (status === 'IN_PROGRESS') newBoard.inProgress.push(updatedTask)
          else newBoard.completed.push(updatedTask)

          queryClient.setQueryData(queryKeys.tasks.board(), newBoard)
        }
      }
      return { previousBoard }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(queryKeys.tasks.board(), context.previousBoard)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/api/v1/tasks/${taskId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() })
    },
  })
}
