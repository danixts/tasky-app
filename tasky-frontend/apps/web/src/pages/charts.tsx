import { useTaskBoard } from '@tasky/services'
import { Skeleton } from '@tasky/ui'
import { TaskChart } from '@/components/task-chart'

export function ChartsPage() {
  const { data: board, isLoading } = useTaskBoard()

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-6 text-lg font-semibold">Graficos de Tareas</h1>
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : board ? (
        <TaskChart board={board} />
      ) : null}
    </div>
  )
}
