import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { Task, TaskStatus } from '@tasky/services'
import { useTaskBoard, useCreateTask, useUpdateTask, useMoveTask, useDeleteTask } from '@tasky/services'
import { Button, Skeleton } from '@tasky/ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@tasky/ui'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { TaskColumn } from './task-column'
import { TaskCard } from './task-card'
import { TaskForm } from './task-form'

const COLUMNS: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED']

export function TaskBoard() {
  const toast = useToast()
  const { data: board, isLoading } = useTaskBoard()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const moveTask = useMoveTask()
  const deleteTask = useDeleteTask()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function getTasksForStatus(status: TaskStatus): Task[] {
    if (!board) return []
    if (status === 'PENDING') return board.pending
    if (status === 'IN_PROGRESS') return board.inProgress
    return board.completed
  }

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined
    setActiveTask(task || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    let targetStatus: TaskStatus | null = null
    if (COLUMNS.includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus
    } else {
      const allTasks = board
        ? [...board.pending, ...board.inProgress, ...board.completed]
        : []
      const overTask = allTasks.find((t) => t.taskId === overId)
      if (overTask) targetStatus = overTask.status
    }

    if (!targetStatus) return

    const allTasks = board ? [...board.pending, ...board.inProgress, ...board.completed] : []
    const currentTask = allTasks.find((t) => t.taskId === taskId)
    if (!currentTask || currentTask.status === targetStatus) return

    moveTask.mutate(
      { taskId, status: targetStatus },
      {
        onError: (err) =>
          toast.error('Error al mover', err instanceof Error ? err.message : 'No se pudo mover la tarea'),
      }
    )
  }

  async function handleFormSubmit(data: { title: string; description?: string; status: TaskStatus; taskId?: string }) {
    try {
      if (data.taskId) {
        await updateTask.mutateAsync({
          taskId: data.taskId,
          title: data.title,
          description: data.description,
          status: data.status,
        })
        toast.success('Tarea actualizada', 'Los cambios se guardaron correctamente')
      } else {
        await createTask.mutateAsync({
          title: data.title,
          description: data.description,
          status: data.status,
        })
        toast.success('Tarea creada', 'La tarea se agrego al tablero')
      }
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo guardar la tarea')
      throw err
    }
  }

  function handleEdit(task: Task) {
    setEditingTask(task)
    setFormOpen(true)
  }

  function handleNewTask() {
    setEditingTask(null)
    setFormOpen(true)
  }

  function handleConfirmDelete() {
    if (deleteId) {
      deleteTask.mutate(deleteId, {
        onSuccess: () => {
          toast.success('Tarea eliminada')
          setDeleteId(null)
        },
        onError: (err) => {
          toast.error('Error al eliminar', err instanceof Error ? err.message : 'No se pudo eliminar la tarea')
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col} className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const totalTasks = board ? board.pending.length + board.inProgress.length + board.completed.length : 0

  return (
    <>
      <div className="border-b bg-muted/30 px-4 py-3 md:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Tareas</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {totalTasks} total
            </span>
          </div>
          <Button size="sm" onClick={handleNewTask} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 md:grid-cols-3 h-full">
            {COLUMNS.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={getTasksForStatus(status)}
                onEdit={handleEdit}
                onDelete={setDeleteId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="w-72 rotate-3 cursor-grabbing">
                <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente esta tarea.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
