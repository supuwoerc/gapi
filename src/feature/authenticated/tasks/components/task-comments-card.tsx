'use no memo'

import * as React from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import type { Comment } from '@/schema/task/detail'
import { getTaskComments } from '@/service/tasks/detail'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Download, FileIcon, Loader2, MessageSquare, MessageSquarePlus, Reply } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { CommentDialog } from './comment-dialog'

const PAGE_SIZE = 10

interface TaskCommentsCardProps {
  taskId: number
}

export function TaskCommentsCard({ taskId }: TaskCommentsCardProps) {
  const { t } = useTranslation('tasks')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [replyTarget, setReplyTarget] = React.useState<{ id: number; author: string } | undefined>()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['task-comments', taskId],
    queryFn: ({ pageParam }) =>
      getTaskComments({ task_id: taskId, page: pageParam, page_size: PAGE_SIZE }),
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0)
      const total = allPages[0]?.total ?? 0
      return loaded < total ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
  })

  const allItems = React.useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data?.pages])

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 96,
    overscan: 5,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  const virtualItems = virtualizer.getVirtualItems()

  React.useEffect(() => {
    const lastItem = virtualItems.at(-1)
    if (!lastItem) return

    if (lastItem.index >= allItems.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [virtualItems, allItems.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleCreateComment() {
    setReplyTarget(undefined)
    setDialogOpen(true)
  }

  function handleReply(comment: Comment) {
    setReplyTarget({ id: comment.id, author: comment.author })
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="gap-1 py-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-1">
            <MessageSquare className="size-4" />
            {t('detail.comments.title')}
          </CardTitle>
          <CardAction>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={handleCreateComment}>
                  <MessageSquarePlus className="size-4 font-bold" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('detail.comments.create')}</TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <CardContent>
          {allItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('detail.comments.empty')}</p>
          ) : (
            <div ref={scrollRef} className="max-h-[500px] overflow-y-auto">
              <div
                className="relative w-full"
                style={{ height: `${virtualizer.getTotalSize()}px` }}
              >
                {virtualItems.map((virtualItem) => {
                  const isLoaderRow = virtualItem.index >= allItems.length
                  const comment = allItems[virtualItem.index]

                  return (
                    <div
                      key={virtualItem.key}
                      ref={virtualizer.measureElement}
                      data-index={virtualItem.index}
                      className="absolute top-0 left-0 w-full"
                      style={{
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      {isLoaderRow ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : comment ? (
                        <div className="group py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">{comment.author}</span>
                              {comment.reply_to_user && (
                                <span className="text-xs text-muted-foreground">
                                  {t('detail.comments.reply')} {comment.reply_to_user}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {comment.created_at.toLocaleString()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="opacity-0 group-hover:opacity-100"
                              onClick={() => handleReply(comment)}
                            >
                              <Reply className="size-4 font-bold" />
                            </Button>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>

                          {comment.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {comment.attachments.map((attachment) =>
                                attachment.mime_type.startsWith('image/') ? (
                                  <HoverCard key={attachment.id}>
                                    <HoverCardTrigger asChild>
                                      <img
                                        src={attachment.file_url}
                                        alt={attachment.file_name}
                                        className="size-12 cursor-pointer rounded border object-cover"
                                      />
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80 p-2">
                                      <img
                                        src={attachment.file_url}
                                        alt={attachment.file_name}
                                        className="w-full rounded"
                                      />
                                    </HoverCardContent>
                                  </HoverCard>
                                ) : (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center gap-1 rounded border px-2 py-1"
                                  >
                                    <FileIcon className="size-3.5 text-muted-foreground" />
                                    <span className="max-w-24 truncate text-xs">
                                      {attachment.file_name}
                                    </span>
                                    <a
                                      href={attachment.file_url}
                                      download={attachment.file_name}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <Button variant="ghost" size="icon-xs">
                                        <Download className="size-3" />
                                      </Button>
                                    </a>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {virtualItem.index < allItems.length - 1 && (
                            <Separator className="mt-2" />
                          )}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CommentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        taskId={taskId}
        parentComment={replyTarget}
      />
    </>
  )
}
