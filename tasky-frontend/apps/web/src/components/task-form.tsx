import { useState, useEffect, type FormEvent } from 'react'
import type { Task, TaskStatus, CreateTaskRequest } from '@tasky/services'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
} from '@tasky/ui'
import { Loader2 } from 'lucide-react'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  onSubmit: (data: CreateTaskRequest & { taskId?: string }) => Promise<void>
}

export function TaskForm({ open, onOpenChange, task, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('PENDING')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
    } else {
      setTitle('')
      setDescription('')
      setStatus('PENDING')
    }
  }, [task, open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        title,
        description: description || undefined,
        status,
        ...(task ? { taskId: task.taskId } : {}),
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
          <DialogDescription>
            {task ? 'Modifica los detalles de la tarea' : 'Completa los campos para crear una tarea'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la tarea"
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion opcional..."
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completada</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {task ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
