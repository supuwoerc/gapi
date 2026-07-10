'use no memo'

import type { ComponentType, ReactNode } from 'react'

import type { TaskDetail } from '@/schema/task/detail'
import type { TaskLevel, TaskType, TaskUser } from '@/schema/task/task'
import {
  Bug,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Flag,
  ListTodo,
  Sparkles,
  UserCheck,
  UserPlus,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

const typeIcons: Record<TaskType, ComponentType<{ className?: string }>> = {
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
  const { t } = useTranslation('tasks')

  if (loading) {
    return (
      <Card className="gap-4 py-5">
        <CardHeader>
          <Skeleton className="h-8 w-full max-w-2xl" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!task) return null

  return (
    <Card className="gap-4 py-5">
      <CardHeader>
        <CardTitle className="max-w-4xl text-2xl leading-tight font-semibold tracking-tight break-words text-primary sm:text-3xl">
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {task.description ? (
          <ReadOnlyEditor content={task.description} />
        ) : (
          <p className="text-muted-foreground">{t('detail.noDescription')}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function TaskSidebarInfoCard({ task, loading }: TaskInfoCardProps) {
  const { t } = useTranslation('tasks')

  if (loading) {
    return (
      <Card className="gap-4 py-5">
        <CardHeader>
          <Skeleton className="h-6 w-16" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-36" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!task) return null

  const TypeIcon = typeIcons[task.type]

  return (
    <Card className="gap-4 py-5">
      <CardHeader>
        <CardTitle>{t('detail.info')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PersonInfoRow
          label={t('detail.fields.creator')}
          user={task.creator}
          icon={<UserPlus className="size-4 text-muted-foreground" />}
        />
        <PersonInfoRow
          label={t('detail.fields.assignee')}
          user={task.assignee}
          icon={<UserCheck className="size-4 text-muted-foreground" />}
        />
        <PersonInfoRow
          label={t('detail.fields.resolver')}
          user={task.resolver}
          icon={<CheckCircle2 className="size-4 text-muted-foreground" />}
        />
        <InfoRow
          label={t('columns.level')}
          icon={<Flag className="size-4 text-muted-foreground" />}
        >
          <Badge variant="outline" className={cn('capitalize', levelStyles.get(task.level))}>
            {t(`level.${task.level}`)}
          </Badge>
        </InfoRow>
        <InfoRow
          label={t('detail.fields.type')}
          icon={<TypeIcon className="size-4 text-muted-foreground" />}
        >
          <span className="text-sm font-medium">{t(`type.${task.type}`)}</span>
        </InfoRow>
        <TimeInfoRow
          label={t('detail.fields.createdAt')}
          value={task.created_at.toLocaleString()}
          icon={<Calendar className="size-4 text-muted-foreground" />}
        />
        <TimeInfoRow
          label={t('detail.fields.updatedAt')}
          value={task.updated_at.toLocaleString()}
          icon={<CalendarClock className="size-4 text-muted-foreground" />}
        />
      </CardContent>
    </Card>
  )
}

function PersonInfoRow({
  label,
  user,
  icon,
}: {
  label: string
  user: TaskUser | null
  icon: ReactNode
}) {
  return (
    <InfoRow label={label} icon={icon}>
      {user ? (
        <div className="flex min-w-0 items-center gap-2 text-left">
          <Avatar size="sm">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getNameInitial(user.name)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 truncate text-sm font-medium">{user.name}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )}
    </InfoRow>
  )
}

function TimeInfoRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <InfoRow label={label} icon={icon}>
      <span className="text-right text-sm font-medium">{value}</span>
    </InfoRow>
  )
}

function InfoRow({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex max-w-[64%] min-w-0 justify-end">{children}</div>
    </div>
  )
}

function getNameInitial(name: string) {
  return name.trim().charAt(0).toUpperCase()
}
