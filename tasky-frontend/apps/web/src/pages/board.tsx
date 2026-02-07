import { TaskBoard } from '@/components/task-board'

export function BoardPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-card px-4 py-3 md:px-6">
        <h1 className="text-lg font-semibold">Mi Tablero de Tareas</h1>
        <p className="text-sm text-muted-foreground">Organiza y gestiona tus tareas arrastrandolas entre columnas</p>
      </div>
      <TaskBoard />
    </div>
  )
}
