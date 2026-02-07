import type { TaskStatus } from './types/task'

export const queryKeys = {
  auth: {
    all: () => ['auth'] as const,
  },
  tasks: {
    all: () => ['tasks'] as const,
    list: (status?: TaskStatus) => [...queryKeys.tasks.all(), 'list', status] as const,
    detail: (id: string) => [...queryKeys.tasks.all(), 'detail', id] as const,
    board: () => [...queryKeys.tasks.all(), 'board'] as const,
  },
}
