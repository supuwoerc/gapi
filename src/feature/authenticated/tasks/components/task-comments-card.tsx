'use no memo'

import * as React from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import { getTaskComments } from '@/service/tasks/detail'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Loader2, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 10

interface TaskCommentsCardProps {
  taskId: number
}

export function TaskCommentsCard({ taskId }: TaskCommentsCardProps) {
  const { t } = useTranslation('feature')
  const scrollRef = React.useRef<HTMLDivElement>(null)

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
    <Card className="gap-1 py-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <MessageSquare className="size-4" />
          {t('taskDetail.comments.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('taskDetail.comments.empty')}</p>
        ) : (
          <div ref={scrollRef} className="max-h-[500px] overflow-y-auto">
            <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
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
                      <div className="py-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {comment.created_at.toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
                        {virtualItem.index < allItems.length - 1 && <Separator className="mt-2" />}
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
  )
}
