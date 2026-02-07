import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, TaskStatus } from '@tasky/services'
import { Badge } from '@tasky/ui'
import { cn } from '@tasky/ui'
import { TaskCard } from './task-card'

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800' },
  IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
  COMPLETED: { label: 'Completada', color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
}

interface TaskColumnProps {
  status: TaskStatus
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskColumn({ status, tasks, onEdit, onDelete }: TaskColumnProps) {
  const config = STATUS_CONFIG[status]
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-card transition-all',
        config.border,
        isOver && 'border-primary/50 bg-primary/5 ring-2 ring-primary/20'
      )}
    >
      <div className={cn('flex items-center gap-2 border-b px-4 py-3', config.bg)}>
        <span className={cn('h-2.5 w-2.5 rounded-full', config.color)} />
        <h3 className="text-sm font-semibold">{config.label}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {tasks.length}
        </Badge>
      </div>
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2 p-2 min-h-[150px]">
        <SortableContext items={tasks.map((t) => t.taskId)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.taskId} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-md border border-dashed p-4">
            <p className="text-xs text-muted-foreground">Sin tareas</p>
          </div>
        )}
      </div>
    </div>
  )
}
