import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@tasky/services'
import { Card, CardContent, Button } from '@tasky/ui'
import { cn } from '@tasky/ui/lib/utils'
import { GripVertical, Trash2, Pencil } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.taskId,
    data: { task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative cursor-default transition-all hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary/20'
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div
            className="mt-0.5 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium leading-tight line-clamp-2">{task.title}</h4>
            {task.description && (
              <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground">
              {new Date(task.createdAt).toLocaleDateString('es', {
                day: '2-digit',
                month: 'short',
              })}
            </p>
          </div>
          <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(task)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(task.taskId)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
