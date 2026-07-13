import * as React from 'react'

import type { Workflow } from '@/schema/workflow/workflow'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Link2, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const WorkflowCardMinWidth = 272
const WorkflowGridGap = 12
const WorkflowRowEstimate = 156

interface WorkflowsListProps {
  workflows: Workflow[]
  workflowsTotal: number
  keyword: string
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onKeywordChange: (keyword: string) => void
  onLoadMore: () => void
  onSelectWorkflow: (workflowId: number) => void
}

export function WorkflowsList({
  workflows,
  workflowsTotal,
  keyword,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onKeywordChange,
  onLoadMore,
  onSelectWorkflow,
}: WorkflowsListProps) {
  const { t } = useTranslation('workflows')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = React.useState(1)
  const [searchValue, setSearchValue] = React.useState(keyword)
  const debouncedKeywordChange = useDebouncedCallback((value: string) => {
    onKeywordChange(value.trim())
  }, 300)

  const workflowRowCount = Math.ceil(workflows.length / columnCount)
  const virtualRowCount = workflowRowCount + (hasNextPage ? 1 : 0)

  React.useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const updateColumnCount = () => {
      const nextColumnCount = Math.max(
        1,
        Math.floor(
          (scrollElement.clientWidth + WorkflowGridGap) / (WorkflowCardMinWidth + WorkflowGridGap)
        )
      )

      setColumnCount((current) => (current === nextColumnCount ? current : nextColumnCount))
    }

    updateColumnCount()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateColumnCount)
      return () => window.removeEventListener('resize', updateColumnCount)
    }

    const resizeObserver = new ResizeObserver(updateColumnCount)
    resizeObserver.observe(scrollElement)

    return () => resizeObserver.disconnect()
  }, [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: virtualRowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => WorkflowRowEstimate,
    overscan: 4,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  const virtualRows = virtualizer.getVirtualItems()

  React.useEffect(() => {
    const lastRow = virtualRows.at(-1)
    if (!lastRow || isLoading || !hasNextPage || isFetchingNextPage) return

    if (lastRow.index >= workflowRowCount - 1) {
      onLoadMore()
    }
  }, [virtualRows, workflowRowCount, hasNextPage, isFetchingNextPage, isLoading, onLoadMore])

  return (
    <section className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden">
      <div className="flex flex-col gap-2">
        <div className="relative p-0.5">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            aria-label={t('search')}
            className="pl-9"
            placeholder={t('search')}
            onChange={(event) => {
              const value = event.target.value
              setSearchValue(value)
              debouncedKeywordChange(value)
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {t('searchResultCount', {
            count: workflows.length,
            total: workflowsTotal,
          })}
        </span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-lg" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {t('emptySearch.description')}
          </div>
        ) : (
          <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualRows.map((virtualRow) => {
              const isLoaderRow = virtualRow.index >= workflowRowCount
              const rowStart = virtualRow.index * columnCount
              const rowWorkflows = workflows.slice(rowStart, rowStart + columnCount)

              return (
                <div
                  key={virtualRow.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  className="absolute top-0 left-0 w-full pb-3"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {isLoaderRow ? (
                    <div className="flex min-h-12 items-center justify-center">
                      {isFetchingNextPage ? <Spinner className="text-muted-foreground" /> : null}
                    </div>
                  ) : (
                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                      }}
                    >
                      {rowWorkflows.map((workflow) => (
                        <button
                          key={workflow.id}
                          type="button"
                          className="flex h-36 min-w-0 flex-col gap-3 overflow-hidden rounded-lg border bg-background p-4 text-start transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                          onClick={() => onSelectWorkflow(workflow.id)}
                        >
                          <span className="flex min-w-0 items-start justify-between gap-3">
                            <span className="flex min-w-0 flex-col gap-1">
                              <span className="min-w-0 truncate text-base font-medium">
                                {workflow.name}
                              </span>
                              <Badge variant="secondary" className="w-fit">
                                {t(`types.${workflow.type}`)}
                              </Badge>
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="shrink-0 gap-1"
                                  aria-label={t('referencedCount', {
                                    count: workflow.used_count,
                                  })}
                                >
                                  <Link2 className="size-3" />
                                  {workflow.used_count}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t('referencedCount', { count: workflow.used_count })}
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className="line-clamp-3 overflow-hidden text-sm leading-5 text-muted-foreground">
                            {workflow.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
