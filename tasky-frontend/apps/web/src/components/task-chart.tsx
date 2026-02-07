import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TaskBoard } from '@tasky/services'
import { Card, CardHeader, CardTitle, CardContent } from '@tasky/ui'

const COLORS = {
  PENDING: '#eab308',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
}

const LABELS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
}

interface TaskChartProps {
  board: TaskBoard
}

export function TaskChart({ board }: TaskChartProps) {
  const data = [
    { name: LABELS.PENDING, value: board.pending.length, fill: COLORS.PENDING },
    { name: LABELS.IN_PROGRESS, value: board.inProgress.length, fill: COLORS.IN_PROGRESS },
    { name: LABELS.COMPLETED, value: board.completed.length, fill: COLORS.COMPLETED },
  ]

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">No hay tareas para mostrar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribucion por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tareas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Tareas" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {data.map((d) => (
              <div key={d.name} className="rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold" style={{ color: d.fill }}>
                  {d.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{d.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
