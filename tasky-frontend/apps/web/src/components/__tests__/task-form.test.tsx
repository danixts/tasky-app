import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { TaskForm } from '../task-form'
import type { Task } from '@tasky/services'

const mockTask: Task = {
  taskId: '456',
  title: 'Tarea existente',
  description: 'Descripcion existente',
  status: 'IN_PROGRESS',
  createdAt: '2026-02-06T12:00:00',
  updatedAt: '2026-02-06T12:00:00',
}

describe('TaskForm', () => {
  it('renders create form when no task provided', () => {
    renderWithProviders(
      <TaskForm open={true} onOpenChange={() => {}} onSubmit={async () => {}} />
    )
    expect(screen.getByText('Nueva Tarea')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear/i })).toBeInTheDocument()
  })

  it('renders edit form when task provided', () => {
    renderWithProviders(
      <TaskForm open={true} onOpenChange={() => {}} task={mockTask} onSubmit={async () => {}} />
    )
    expect(screen.getByText('Editar Tarea')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Tarea existente')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Descripcion existente')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('calls onSubmit with form data for new task', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <TaskForm open={true} onOpenChange={() => {}} onSubmit={onSubmit} />
    )

    fireEvent.change(screen.getByLabelText('Titulo'), { target: { value: 'Nueva tarea' } })
    fireEvent.change(screen.getByLabelText('Descripcion'), { target: { value: 'Desc' } })
    fireEvent.click(screen.getByRole('button', { name: /crear/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Nueva tarea',
        description: 'Desc',
        status: 'PENDING',
      })
    })
  })

  it('calls onSubmit with taskId for edit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <TaskForm open={true} onOpenChange={() => {}} task={mockTask} onSubmit={onSubmit} />
    )

    fireEvent.change(screen.getByLabelText('Titulo'), { target: { value: 'Actualizada' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: '456',
          title: 'Actualizada',
        })
      )
    })
  })

  it('does not render when closed', () => {
    renderWithProviders(
      <TaskForm open={false} onOpenChange={() => {}} onSubmit={async () => {}} />
    )
    expect(screen.queryByText('Nueva Tarea')).not.toBeInTheDocument()
  })
})
