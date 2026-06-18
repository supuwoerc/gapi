'use no memo'

import { useQuery } from '@tanstack/react-query'

import { getTaskTimeline } from '@/service/tasks/detail'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface TaskTimelineCardProps {
  taskId: number
}

export function TaskTimelineCard({ taskId }: TaskTimelineCardProps) {
  const { t } = useTranslation('task-detail')

  const { data, isLoading } = useQuery({
    queryKey: ['task-timeline', taskId],
    queryFn: () => getTaskTimeline({ task_id: taskId, page: 1, page_size: 100 }),
  })

  const items = data?.data ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-1">
              <Skeleton className="size-2 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-1 py-4">
      <CardHeader>
        <CardTitle>{t('timeline.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="max-h-[500px] space-y-0 overflow-y-auto">
            {items.map((event, index) => (
              <div key={event.id} className="flex gap-1">
                <div className="relative flex flex-col items-center">
                  <div className="mt-1.5 size-2 rounded-full bg-primary" />
                  {index < items.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm">
                    <span className="font-medium">{event.actor}</span>{' '}
                    <span className="text-muted-foreground">
                      {event.action === 'assigned'
                        ? t('timeline.assigned', { target: event.detail })
                        : event.action === 'level_changed'
                          ? t('timeline.levelChanged', { level: event.detail })
                          : t(`timeline.${event.action as 'created' | 'resolved' | 'commented'}`)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {event.created_at.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">-</p>
        )}
      </CardContent>
    </Card>
  )
}
