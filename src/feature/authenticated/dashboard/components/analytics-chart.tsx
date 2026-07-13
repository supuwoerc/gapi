import { useTranslation } from 'react-i18next'
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const projectExecutionData = [
  {
    dayKey: 'project.chart.days.mon',
    requirements: 4,
    tasks: 9,
    sandboxes: 5,
  },
  {
    dayKey: 'project.chart.days.tue',
    requirements: 6,
    tasks: 12,
    sandboxes: 7,
  },
  {
    dayKey: 'project.chart.days.wed',
    requirements: 5,
    tasks: 15,
    sandboxes: 8,
  },
  {
    dayKey: 'project.chart.days.thu',
    requirements: 8,
    tasks: 17,
    sandboxes: 10,
  },
  {
    dayKey: 'project.chart.days.fri',
    requirements: 7,
    tasks: 14,
    sandboxes: 9,
  },
  {
    dayKey: 'project.chart.days.sat',
    requirements: 3,
    tasks: 8,
    sandboxes: 4,
  },
  {
    dayKey: 'project.chart.days.sun',
    requirements: 2,
    tasks: 6,
    sandboxes: 3,
  },
] as const

export function AnalyticsChart() {
  const { t } = useTranslation('dashboard')
  const data = projectExecutionData.map((item) => ({
    ...item,
    name: t(item.dayKey),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis
          dataKey="name"
          stroke="currentColor"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="requirements"
          name={t('project.chart.requirements')}
          stroke="var(--chart-1)"
          fill="var(--chart-1)"
          fillOpacity={0.15}
        />
        <Area
          type="monotone"
          dataKey="tasks"
          name={t('project.chart.tasks')}
          stroke="var(--chart-2)"
          fill="var(--chart-2)"
          fillOpacity={0.12}
        />
        <Area
          type="monotone"
          dataKey="sandboxes"
          name={t('project.chart.sandboxes')}
          stroke="var(--chart-3)"
          fill="var(--chart-3)"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
