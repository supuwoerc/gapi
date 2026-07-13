import { CheckCircle2, GitBranch, PlayCircle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { AnalyticsChart } from './analytics-chart'

interface ProjectAnalyticsProps {
  projectName: string
}

export function ProjectAnalytics({ projectName }: ProjectAnalyticsProps) {
  const { t } = useTranslation('dashboard')

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('project.chart.title')}</CardTitle>
          <CardDescription>{t('project.chart.description', { projectName })}</CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <AnalyticsChart />
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('project.stats.tasks.label')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('project.stats.tasks.value')}</div>
            <p className="text-xs text-muted-foreground">{t('project.stats.tasks.description')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('project.stats.workflows.label')}
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('project.stats.workflows.value')}</div>
            <p className="text-xs text-muted-foreground">
              {t('project.stats.workflows.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('project.stats.sandboxes.label')}
            </CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('project.stats.sandboxes.value')}</div>
            <p className="text-xs text-muted-foreground">
              {t('project.stats.sandboxes.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('project.stats.qa.label')}</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('project.stats.qa.value')}</div>
            <p className="text-xs text-muted-foreground">{t('project.stats.qa.description')}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>{t('project.aiEmployees.title')}</CardTitle>
            <CardDescription>{t('project.aiEmployees.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={[
                { name: t('project.aiEmployees.developer'), value: 4 },
                { name: t('project.aiEmployees.qa'), value: 2 },
                { name: t('project.aiEmployees.architect'), value: 1 },
                { name: t('project.aiEmployees.designer'), value: 1 },
                { name: t('project.aiEmployees.pm'), value: 1 },
              ]}
              barClass="bg-primary"
              valueFormatter={(n) => t('project.aiEmployees.unit', { count: n })}
            />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('project.workflowStages.title')}</CardTitle>
            <CardDescription>{t('project.workflowStages.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={[
                { name: t('project.workflowStages.requirements'), value: 12 },
                { name: t('project.workflowStages.implementation'), value: 9 },
                { name: t('project.workflowStages.review'), value: 6 },
                { name: t('project.workflowStages.qa'), value: 4 },
              ]}
              barClass="bg-muted-foreground"
              valueFormatter={(n) => t('project.workflowStages.unit', { count: n })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className="space-y-3">
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 truncate text-xs text-muted-foreground">{i.name}</div>
              <div className="h-2.5 w-full rounded-full bg-muted">
                <div className={`h-2.5 rounded-full ${barClass}`} style={{ width }} />
              </div>
            </div>
            <div className="ps-2 text-xs font-medium tabular-nums">{valueFormatter(i.value)}</div>
          </li>
        )
      })}
    </ul>
  )
}
