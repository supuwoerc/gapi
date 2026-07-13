'use no memo'

import type { ReactNode } from 'react'

import type { WorkflowDetail } from '@/schema/workflow/workflow'
import { Calendar, CalendarClock, Info, Link2, Lock, PencilLine, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Skeleton } from '@/components/ui/skeleton'

interface WorkflowBasicInfoHoverCardProps {
  workflow?: WorkflowDetail
  loading?: boolean
  canEdit?: boolean
}

export function WorkflowBasicInfoHoverCard({
  workflow,
  loading,
  canEdit,
}: WorkflowBasicInfoHoverCardProps) {
  const { t } = useTranslation('workflows')

  if (loading) {
    return <Skeleton className="h-9 w-44 rounded-md" />
  }

  if (!workflow) return null

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <Button variant="outline" className="max-w-full justify-start gap-2">
          <Info className="size-4 text-muted-foreground" />
          <span>{t('createPage.basicInfo')}</span>
          <Badge
            variant="outline"
            className={cn(
              'ml-1 hidden shrink-0 sm:inline-flex',
              canEdit
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'border-muted bg-muted text-muted-foreground'
            )}
          >
            {canEdit ? t('detail.basicInfo.editable') : t('detail.basicInfo.readonly')}
          </Badge>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-primary">{workflow.name}</h2>
                <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {workflow.description}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'shrink-0',
                  canEdit
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-muted bg-muted text-muted-foreground'
                )}
              >
                {canEdit ? t('detail.basicInfo.editable') : t('detail.basicInfo.readonly')}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <InfoRow
              label={t('detail.basicInfo.creator')}
              icon={<UserRound className="size-4 text-muted-foreground" />}
            >
              <div className="flex min-w-0 items-center gap-2 text-left">
                <Avatar size="sm">
                  <AvatarImage src={workflow.creator.avatar} alt={workflow.creator.name} />
                  <AvatarFallback>{getNameInitial(workflow.creator.name)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 truncate text-sm font-medium">
                  {workflow.creator.name}
                </span>
              </div>
            </InfoRow>
            <InfoRow
              label={t('detail.basicInfo.usedCount')}
              icon={<Link2 className="size-4 text-muted-foreground" />}
            >
              <span className="text-sm font-medium">{workflow.used_count}</span>
            </InfoRow>
            <InfoRow
              label={t('detail.basicInfo.type')}
              icon={<Info className="size-4 text-muted-foreground" />}
            >
              <Badge variant="secondary">{t(`types.${workflow.type}`)}</Badge>
            </InfoRow>
            <InfoRow
              label={t('detail.basicInfo.createdAt')}
              icon={<Calendar className="size-4 text-muted-foreground" />}
            >
              <span className="text-right text-sm font-medium">
                {workflow.created_at.toLocaleString()}
              </span>
            </InfoRow>
            <InfoRow
              label={t('detail.basicInfo.updatedAt')}
              icon={<CalendarClock className="size-4 text-muted-foreground" />}
            >
              <span className="text-right text-sm font-medium">
                {workflow.updated_at.toLocaleString()}
              </span>
            </InfoRow>
            <InfoRow
              label={t('detail.basicInfo.permission')}
              icon={
                canEdit ? (
                  <PencilLine className="size-4 text-muted-foreground" />
                ) : (
                  <Lock className="size-4 text-muted-foreground" />
                )
              }
            >
              <span className="text-sm font-medium">
                {canEdit ? t('detail.basicInfo.editable') : t('detail.basicInfo.readonly')}
              </span>
            </InfoRow>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
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
      <div className="flex max-w-[62%] min-w-0 justify-end">{children}</div>
    </div>
  )
}

function getNameInitial(name: string) {
  return name.trim().charAt(0).toUpperCase()
}
