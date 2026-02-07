import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { TaskChart } from '../task-chart'
import type { TaskBoard } from '@tasky/services'

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div>{children}</div>,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))

const mockBoard: TaskBoard = {
  pending: [
    { taskId: '1', title: 'T1', description: null, status: 'PENDING', createdAt: '', updatedAt: '' },
    { taskId: '2', title: 'T2', description: null, status: 'PENDING', createdAt: '', updatedAt: '' },
  ],
  inProgress: [
    { taskId: '3', title: 'T3', description: null, status: 'IN_PROGRESS', createdAt: '', updatedAt: '' },
  ],
  completed: [
    { taskId: '4', title: 'T4', description: null, status: 'COMPLETED', createdAt: '', updatedAt: '' },
    { taskId: '5', title: 'T5', description: null, status: 'COMPLETED', createdAt: '', updatedAt: '' },
    { taskId: '6', title: 'T6', description: null, status: 'COMPLETED', createdAt: '', updatedAt: '' },
  ],
}

describe('TaskChart', () => {
  it('renders charts when there are tasks', () => {
    renderWithProviders(<TaskChart board={mockBoard} />)
    expect(screen.getByText('Distribucion por Estado')).toBeInTheDocument()
    expect(screen.getByText('Tareas por Estado')).toBeInTheDocument()
    expect(screen.getByText('Resumen')).toBeInTheDocument()
  })

  it('shows correct counts in summary', () => {
    renderWithProviders(<TaskChart board={mockBoard} />)
    expect(screen.getByText('2')).toBeInTheDocument() // pending
    expect(screen.getByText('1')).toBeInTheDocument() // in_progress
    expect(screen.getByText('3')).toBeInTheDocument() // completed
  })

  it('shows status labels in summary', () => {
    renderWithProviders(<TaskChart board={mockBoard} />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('En Progreso')).toBeInTheDocument()
    expect(screen.getByText('Completada')).toBeInTheDocument()
  })

  it('shows empty message when no tasks', () => {
    const emptyBoard: TaskBoard = { pending: [], inProgress: [], completed: [] }
    renderWithProviders(<TaskChart board={emptyBoard} />)
    expect(screen.getByText('No hay tareas para mostrar')).toBeInTheDocument()
  })
})
