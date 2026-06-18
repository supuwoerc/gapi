'use no memo'

import type { TaskDetail } from '@/schema/task/detail'
import type { TaskLevel, TaskType } from '@/schema/task/task'
import { Bug, Calendar, ListTodo, Sparkles, User, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { ReadOnlyEditor } from '@/components/lexical/read-only-editor'

const levelStyles = new Map<TaskLevel, string>([
  ['low', 'bg-neutral-300/40 border-neutral-300'],
  ['medium', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['high', 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300'],
  [
    'critical',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

const typeIcons: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  bug: Bug,
  feature: Sparkles,
  improvement: Zap,
  task: ListTodo,
}

interface TaskInfoCardProps {
  task?: TaskDetail
  loading?: boolean
}

export function TaskInfoCard({ task, loading }: TaskInfoCardProps) {
  const { t } = useTranslation(['task-detail', 'tasks'])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!task) return null

  const TypeIcon = typeIcons[task.type]

  return (
    <div className="space-y-3">
      <Card className="gap-1 py-4">
        <CardHeader>
          <CardTitle>{t('info')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          <InfoItem
            label={t('fields.type')}
            value={
              <div className="flex items-center gap-1 capitalize">
                <TypeIcon className="size-4 text-muted-foreground" />
                {t(`tasks:type.${task.type}`)}
              </div>
            }
          />
          <InfoItem
            label={t('fields.creator')}
            value={
              <span className="flex items-center gap-1">
                <User className="size-4 text-muted-foreground" />
                {task.creator}
              </span>
            }
          />
          <InfoItem
            label={t('fields.assignee')}
            value={
              <span className="flex items-center gap-1">
                <User className="size-4 text-muted-foreground" />
                {task.assignee}
              </span>
            }
          />
          <InfoItem
            label={t('fields.resolver')}
            value={
              task.resolver ? (
                <span className="flex items-center gap-1">
                  <User className="size-4 text-muted-foreground" />
                  {task.resolver}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )
            }
          />
          <InfoItem
            label={t('fields.createdAt')}
            value={
              <span className="flex items-center gap-1">
                <Calendar className="size-4 text-muted-foreground" />
                {task.created_at.toLocaleDateString()}
              </span>
            }
          />
          <InfoItem
            label={t('fields.updatedAt')}
            value={
              <span className="flex items-center gap-1">
                <Calendar className="size-4 text-muted-foreground" />
                {task.updated_at.toLocaleDateString()}
              </span>
            }
          />
        </CardContent>
      </Card>

      <Card className="gap-1 py-4">
        <CardHeader>
          <CardTitle>{t('description')}</CardTitle>
        </CardHeader>
        <CardContent>
          {task.description ? (
            <ReadOnlyEditor content={task.description} />
          ) : (
            <p className="text-muted-foreground">{t('noDescription')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function TaskLevelBadge({ level }: { level: TaskLevel }) {
  const { t } = useTranslation('tasks')
  return (
    <Badge variant="outline" className={`capitalize ${levelStyles.get(level) ?? ''}`}>
      {t(`level.${level}`)}
    </Badge>
  )
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
