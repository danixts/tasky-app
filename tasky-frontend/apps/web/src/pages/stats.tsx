import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from "recharts";

function ChartGradients({
  idPrefix,
  colors,
  type,
}: {
  readonly idPrefix: string;
  readonly colors: string[];
  readonly type: "linear" | "radial";
}) {
  return (
    <defs>
      {colors.map((color, i) => {
        const id = `${idPrefix}-${i}`;
        if (type === "radial") {
          return (
            <radialGradient
              key={id}
              id={id}
              cx="50%"
              cy="50%"
              r="50%"
              fx="30%"
              fy="30%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.75} />
            </radialGradient>
          );
        }
        return (
          <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.75} />
          </linearGradient>
        );
      })}
    </defs>
  );
}
import { useTaskStats } from "@tasky/services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  LightRays,
} from "@tasky/ui";
import { useTheme } from "@/contexts/theme-context";
import { BarChart2 } from "lucide-react";

const CHART_PALETTE_DARK = [
  "#5ba3f5",
  "#4dd4a8",
  "#f0c14b",
  "#d97dd6",
  "#6ec5e8",
];

function useChartColors(count: number): string[] {
  return useMemo(() => {
    const n = Math.max(count, 3);
    return CHART_PALETTE_DARK.slice(0, n);
  }, [count]);
}

function boardStatusLabel(key: string | number | undefined): string {
  const k = typeof key === "string" ? key : "";
  if (k === "toDo") return "To Do";
  if (k === "inProgress") return "In Progress";
  return "Complete";
}

export function StatsPage() {
  const { data: stats, isLoading: loadingStats } = useTaskStats();
  const byStatus = stats?.summary ?? null;
  const byBoard = stats?.breakdown ?? null;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const raysColor = isDark
    ? "rgba(100, 180, 220, 0.04)"
    : "rgba(120, 180, 230, 0.06)";

  const barData = useMemo(
    () =>
      (byStatus ?? []).map((row) => ({
        name: row.statusLabel,
        count: row.taskCount,
        code: row.statusCode,
      })),
    [byStatus]
  );

  const pieData = useMemo(
    () =>
      (byStatus ?? []).map((row) => ({
        name: row.statusLabel,
        value: row.taskCount,
      })),
    [byStatus]
  );

  const boardChartData = useMemo(() => {
    if (!byBoard?.length) return [];
    const byBoardName = new Map<
      string,
      { name: string; toDo: number; inProgress: number; complete: number }
    >();
    for (const row of byBoard) {
      const key = row.boardId;
      let entry = byBoardName.get(key);
      if (!entry) {
        entry = { name: row.boardName, toDo: 0, inProgress: 0, complete: 0 };
        byBoardName.set(key, entry);
      }
      if (row.statusCode === "TODO") entry.toDo = row.taskCount;
      else if (row.statusCode === "IN_PROGRESS")
        entry.inProgress = row.taskCount;
      else if (row.statusCode === "COMPLETED") entry.complete = row.taskCount;
    }
    return Array.from(byBoardName.values());
  }, [byBoard]);

  const colors = useChartColors(Math.max(barData.length, 3));
  const statusColors = useChartColors(3);
  const barDataWithFill = useMemo(
    () =>
      barData.map((d, i) => ({
        ...d,
        fill: `url(#stats-bar-${i % colors.length})`,
      })),
    [barData, colors]
  );
  const pieDataWithFill = useMemo(
    () =>
      pieData.map((d, i) => ({
        ...d,
        fill: `url(#stats-pie-${i % colors.length})`,
      })),
    [pieData, colors]
  );
  const gridStroke = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.75)";
  const tooltipBg = isDark ? "rgb(28,32,38)" : "var(--popover)";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.12)" : "var(--border)";
  const tooltipText = isDark ? "rgba(255,255,255,0.95)" : "var(--foreground)";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <LightRays
          className="inset-0"
          count={3}
          color={raysColor}
          blur={64}
          opacity={isDark ? 0.12 : 0.18}
          speed={22}
          length="100%"
        />
      </div>
      <div className="relative z-10 flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center gap-2 border-b border-(--border)/60 pb-4">
          <BarChart2 className="h-5 w-5 text-(--primary)" />
          <h1 className="text-xl font-semibold text-(--foreground)">
            Estadísticas de tareas
          </h1>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card
            className={
              isDark
                ? "border-(--border) bg-(--card)/90 text-[#f0f0f0] backdrop-blur"
                : "border-(--border) bg-(--card)/90 backdrop-blur"
            }
          >
            <CardHeader>
              <CardTitle
                className={
                  isDark
                    ? "text-base font-medium text-[#f0f0f0]"
                    : "text-base font-medium text-(--foreground)"
                }
              >
                Tareas por estado
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              {loadingStats && (
                <Skeleton className="h-full w-full rounded-lg" />
              )}
              {!loadingStats && barData.length === 0 && (
                <div
                  className={
                    isDark
                      ? "flex h-full items-center justify-center text-sm text-[#b0b0b0]"
                      : "flex h-full items-center justify-center text-sm text-(--muted-foreground)"
                  }
                >
                  Sin datos
                </div>
              )}
              {!loadingStats && barData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barDataWithFill}
                    margin={{ top: 12, right: 12, left: 0, bottom: 24 }}
                  >
                    <ChartGradients
                      idPrefix="stats-bar"
                      colors={colors}
                      type="linear"
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={gridStroke}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: textColor, fontSize: 12 }}
                      axisLine={{ stroke: gridStroke }}
                      tickLine={{ stroke: gridStroke }}
                    />
                    <YAxis
                      tick={{ fill: textColor, fontSize: 12 }}
                      axisLine={{ stroke: gridStroke }}
                      tickLine={{ stroke: gridStroke }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: "var(--radius)",
                        color: tooltipText,
                      }}
                      labelStyle={{ color: tooltipText }}
                      itemStyle={{ color: tooltipText }}
                      formatter={(value) => [value ?? 0, "Tareas"]}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card
            className={
              isDark
                ? "border-(--border) bg-(--card)/90 text-[#f0f0f0] backdrop-blur"
                : "border-(--border) bg-(--card)/90 backdrop-blur"
            }
          >
            <CardHeader>
              <CardTitle
                className={
                  isDark
                    ? "text-base font-medium text-[#f0f0f0]"
                    : "text-base font-medium text-(--foreground)"
                }
              >
                Distribución por estado
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              {loadingStats && (
                <Skeleton className="h-full w-full rounded-lg" />
              )}
              {!loadingStats && pieData.length === 0 && (
                <div
                  className={
                    isDark
                      ? "flex h-full items-center justify-center text-sm text-[#b0b0b0]"
                      : "flex h-full items-center justify-center text-sm text-(--muted-foreground)"
                  }
                >
                  Sin datos
                </div>
              )}
              {!loadingStats && pieData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartGradients
                      idPrefix="stats-pie"
                      colors={colors}
                      type="radial"
                    />
                    <Pie
                      data={pieDataWithFill}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={88}
                      paddingAngle={2}
                      stroke="var(--background)"
                      strokeWidth={1.5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: "var(--radius)",
                        color: tooltipText,
                      }}
                      labelStyle={{ color: tooltipText }}
                      itemStyle={{ color: tooltipText }}
                      formatter={(value, name) => {
                        const total = pieData.reduce((s, d) => s + d.value, 0);
                        const v = typeof value === "number" ? value : 0;
                        const pct =
                          total > 0 ? Math.round((v / total) * 100) : 0;
                        return [`${v} (${pct}%)`, name ?? ""];
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      formatter={(value) => (
                        <span style={{ color: textColor, fontSize: 12 }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {boardChartData.length > 0 && (
          <Card
            className={
              isDark
                ? "border-(--border) bg-(--card)/90 text-[#f0f0f0] backdrop-blur"
                : "border-(--border) bg-(--card)/90 backdrop-blur"
            }
          >
            <CardHeader>
              <CardTitle
                className={
                  isDark
                    ? "text-base font-medium text-[#f0f0f0]"
                    : "text-base font-medium text-(--foreground)"
                }
              >
                Tareas por tablero
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {loadingStats ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={boardChartData}
                    margin={{ top: 12, right: 12, left: 0, bottom: 28 }}
                    barCategoryGap="20%"
                    barGap={4}
                  >
                    <ChartGradients
                      idPrefix="stats-board"
                      colors={statusColors}
                      type="linear"
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={gridStroke}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: textColor, fontSize: 11 }}
                      axisLine={{ stroke: gridStroke }}
                      tickLine={{ stroke: gridStroke }}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fill: textColor, fontSize: 12 }}
                      axisLine={{ stroke: gridStroke }}
                      tickLine={{ stroke: gridStroke }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: "var(--radius)",
                        color: tooltipText,
                      }}
                      labelStyle={{ color: tooltipText }}
                      itemStyle={{ color: tooltipText }}
                      formatter={(value, name) => [
                        value ?? 0,
                        boardStatusLabel(name),
                      ]}
                      labelFormatter={(label) => `Tablero: ${label}`}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      formatter={(value) => (
                        <span style={{ color: textColor, fontSize: 12 }}>
                          {boardStatusLabel(value)}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="toDo"
                      name="toDo"
                      fill="url(#stats-board-0)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="inProgress"
                      name="inProgress"
                      fill="url(#stats-board-1)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="complete"
                      name="complete"
                      fill="url(#stats-board-2)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
