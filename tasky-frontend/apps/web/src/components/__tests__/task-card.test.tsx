import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { TaskCard } from '../task-card'
import type { Task } from '@tasky/services'
import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

const mockTask: Task = {
  taskId: '123',
  title: 'Tarea de prueba',
  description: 'Descripcion de la tarea',
  status: 'PENDING',
  createdAt: '2026-02-06T12:00:00',
  updatedAt: '2026-02-06T12:00:00',
}

function renderTaskCard(task = mockTask) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  const result = renderWithProviders(
    <DndContext>
      <SortableContext items={[task.taskId]}>
        <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
      </SortableContext>
    </DndContext>
  )

  return { ...result, onEdit, onDelete }
}

describe('TaskCard', () => {
  it('renders task title and description', () => {
    renderTaskCard()
    expect(screen.getByText('Tarea de prueba')).toBeInTheDocument()
    expect(screen.getByText('Descripcion de la tarea')).toBeInTheDocument()
  })

  it('renders creation date', () => {
    renderTaskCard()
    expect(screen.getByText(/06 feb/i)).toBeInTheDocument()
  })

  it('renders task without description', () => {
    renderTaskCard({ ...mockTask, description: null })
    expect(screen.getByText('Tarea de prueba')).toBeInTheDocument()
    expect(screen.queryByText('Descripcion de la tarea')).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    const { onDelete } = renderTaskCard()
    const deleteButtons = screen.getAllByRole('button')
    const deleteBtn = deleteButtons.find((btn) => btn.querySelector('.lucide-trash-2'))
    if (deleteBtn) fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledWith('123')
  })

  it('calls onEdit when edit button is clicked', () => {
    const { onEdit } = renderTaskCard()
    const editButtons = screen.getAllByRole('button')
    const editBtn = editButtons.find((btn) => btn.querySelector('.lucide-pencil'))
    if (editBtn) fireEvent.click(editBtn)
    expect(onEdit).toHaveBeenCalledWith(mockTask)
  })
})
