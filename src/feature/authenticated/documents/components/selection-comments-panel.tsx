'use no memo'

import type { SelectionComment } from '@/schema/selection-comment'
import { MessageSquareText, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

import type { ReadOnlyEditorMarkStatuses } from '@/components/lexical/read-only-editor'
import { ReadOnlyEditor } from '@/components/lexical/read-only-editor'

interface SelectionCommentsPanelProps {
  comments: SelectionComment[]
  loading?: boolean
  activeMarkId?: string
  markStatuses: ReadOnlyEditorMarkStatuses
  onCommentClick: (markId: string) => void
  className?: string
  hideHeader?: boolean
}

export function SelectionCommentsPanel({
  comments,
  loading,
  activeMarkId,
  markStatuses,
  onCommentClick,
  className,
  hideHeader,
}: SelectionCommentsPanelProps) {
  const { t } = useTranslation('documents')

  return (
    <Card className={cn('gap-4 py-5 xl:sticky xl:top-20 xl:max-h-[calc(100vh-7rem)]', className)}>
      {!hideHeader ? (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText />
            {t('detail.selectionComments.title')}
          </CardTitle>
          <CardDescription>
            {t('detail.selectionComments.count', { count: comments.length })}
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className="min-h-0 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquareText />
              </EmptyMedia>
              <EmptyTitle>{t('detail.selectionComments.emptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('detail.selectionComments.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map((comment) => {
              const isLocated = markStatuses[comment.mark_id] !== false
              const isActive = activeMarkId === comment.mark_id

              return (
                <div
                  key={comment.id}
                  role={isLocated ? 'button' : undefined}
                  tabIndex={isLocated ? 0 : -1}
                  aria-disabled={!isLocated}
                  className={cn(
                    'flex w-full min-w-0 flex-col gap-2 rounded-md border bg-background p-3 text-left transition-colors',
                    isLocated
                      ? 'cursor-pointer hover:bg-accent hover:text-accent-foreground'
                      : 'cursor-not-allowed opacity-70',
                    isActive && 'border-primary bg-primary/10'
                  )}
                  onClick={() => {
                    if (isLocated) onCommentClick(comment.mark_id)
                  }}
                  onKeyDown={(event) => {
                    if (!isLocated || (event.key !== 'Enter' && event.key !== ' ')) return
                    event.preventDefault()
                    onCommentClick(comment.mark_id)
                  }}
                >
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {comment.created_at.toLocaleString()}
                      </span>
                    </div>
                    {!isLocated ? (
                      <Badge variant="outline">
                        <TriangleAlert />
                        {t('detail.selectionComments.changed')}
                      </Badge>
                    ) : null}
                  </div>

                  <p className="line-clamp-2 text-xs text-muted-foreground">{comment.quote}</p>

                  <div className="w-full text-sm">
                    <ReadOnlyEditor content={comment.content} format="lexical-json" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
