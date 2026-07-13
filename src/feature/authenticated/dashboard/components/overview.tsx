import { useTranslation } from 'react-i18next'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const userActivityData = [
  {
    monthKey: 'overview.chart.months.jan',
    requirements: 8,
    tasks: 14,
    documents: 5,
  },
  {
    monthKey: 'overview.chart.months.feb',
    requirements: 11,
    tasks: 17,
    documents: 7,
  },
  {
    monthKey: 'overview.chart.months.mar',
    requirements: 9,
    tasks: 21,
    documents: 9,
  },
  {
    monthKey: 'overview.chart.months.apr',
    requirements: 14,
    tasks: 24,
    documents: 12,
  },
  {
    monthKey: 'overview.chart.months.may',
    requirements: 16,
    tasks: 28,
    documents: 15,
  },
  {
    monthKey: 'overview.chart.months.jun',
    requirements: 18,
    tasks: 31,
    documents: 18,
  },
] as const

export function Overview() {
  const { t } = useTranslation('dashboard')
  const data = userActivityData.map((item) => ({
    ...item,
    name: t(item.monthKey),
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="currentColor"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction="ltr"
          stroke="currentColor"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: 'var(--muted)' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="requirements"
          name={t('overview.chart.requirements')}
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="tasks"
          name={t('overview.chart.tasks')}
          fill="var(--chart-2)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="documents"
          name={t('overview.chart.documents')}
          fill="var(--chart-3)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
