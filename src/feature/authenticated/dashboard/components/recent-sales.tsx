import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const activityItems = [
  {
    avatar: '/avatars/01.png',
    fallback: 'PM',
    actorKey: 'overview.activity.items.requirement.actor',
    descriptionKey: 'overview.activity.items.requirement.description',
    metricKey: 'overview.activity.items.requirement.metric',
  },
  {
    avatar: '/avatars/02.png',
    fallback: 'AI',
    actorKey: 'overview.activity.items.workflow.actor',
    descriptionKey: 'overview.activity.items.workflow.description',
    metricKey: 'overview.activity.items.workflow.metric',
  },
  {
    avatar: '/avatars/03.png',
    fallback: 'DO',
    actorKey: 'overview.activity.items.document.actor',
    descriptionKey: 'overview.activity.items.document.description',
    metricKey: 'overview.activity.items.document.metric',
  },
  {
    avatar: '/avatars/04.png',
    fallback: 'OP',
    actorKey: 'overview.activity.items.sandbox.actor',
    descriptionKey: 'overview.activity.items.sandbox.description',
    metricKey: 'overview.activity.items.sandbox.metric',
  },
  {
    avatar: '/avatars/05.png',
    fallback: 'QA',
    actorKey: 'overview.activity.items.qa.actor',
    descriptionKey: 'overview.activity.items.qa.description',
    metricKey: 'overview.activity.items.qa.metric',
  },
] as const

export function RecentActivity() {
  const { t } = useTranslation('dashboard')

  return (
    <div className="space-y-8">
      {activityItems.map((item) => (
        <div key={item.actorKey} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={item.avatar} alt={t(item.actorKey)} />
            <AvatarFallback>{item.fallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm leading-none font-medium">{t(item.actorKey)}</p>
              <p className="truncate text-sm text-muted-foreground">{t(item.descriptionKey)}</p>
            </div>
            <div className="text-sm font-medium tabular-nums">{t(item.metricKey)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
