import * as React from 'react'

import type { Project } from '@/schema/project/project'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

import { ProjectLogo } from './project-logo'
import { ProjectVisibilityBadge } from './project-visibility-badge'

const ProjectCardMinWidth = 256
const ProjectGridGap = 12
const ProjectRowEstimate = 172

interface ProjectsListProps {
  projects: Project[]
  projectsTotal: number
  keyword: string
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onKeywordChange: (keyword: string) => void
  onLoadMore: () => void
  onSelectProject: (projectId: number) => void
}

function getRelationshipKey(project: Project) {
  const membership = project.current_user_membership

  if (membership?.status === 'pending') return 'pending'
  if (membership?.project_role.name === 'Owner') return 'owner'
  if (membership) return 'member'
  if (project.visibility === 'public') return 'canApply'
  return 'private'
}

export function ProjectsList({
  projects,
  projectsTotal,
  keyword,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onKeywordChange,
  onLoadMore,
  onSelectProject,
}: ProjectsListProps) {
  const { t } = useTranslation('projects')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = React.useState(1)
  const [searchValue, setSearchValue] = React.useState(keyword)
  const debouncedKeywordChange = useDebouncedCallback((value: string) => {
    onKeywordChange(value.trim())
  }, 300)

  const projectRowCount = Math.ceil(projects.length / columnCount)
  const virtualRowCount = projectRowCount + (hasNextPage ? 1 : 0)

  React.useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const updateColumnCount = () => {
      const nextColumnCount = Math.max(
        1,
        Math.floor(
          (scrollElement.clientWidth + ProjectGridGap) / (ProjectCardMinWidth + ProjectGridGap)
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
    estimateSize: () => ProjectRowEstimate,
    overscan: 4,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  const virtualRows = virtualizer.getVirtualItems()

  React.useEffect(() => {
    const lastRow = virtualRows.at(-1)
    if (!lastRow || isLoading || !hasNextPage || isFetchingNextPage) return

    if (lastRow.index >= projectRowCount - 1) {
      onLoadMore()
    }
  }, [virtualRows, projectRowCount, hasNextPage, isFetchingNextPage, isLoading, onLoadMore])

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
            count: projects.length,
            total: projectsTotal,
          })}
        </span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {t('emptySearch.description')}
          </div>
        ) : (
          <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualRows.map((virtualRow) => {
              const isLoaderRow = virtualRow.index >= projectRowCount
              const rowStart = virtualRow.index * columnCount
              const rowProjects = projects.slice(rowStart, rowStart + columnCount)

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
                      {rowProjects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          className="flex min-h-40 flex-col justify-between gap-4 rounded-lg border bg-background p-4 text-start transition-colors hover:bg-accent"
                          onClick={() => onSelectProject(project.id)}
                        >
                          <span className="flex min-w-0 items-start gap-3">
                            <ProjectLogo
                              logo={project.logo}
                              name={project.name}
                              className="size-12"
                            />
                            <span className="flex min-w-0 flex-1 flex-col gap-2">
                              <span className="flex min-w-0 flex-wrap items-center gap-2">
                                <span className="truncate text-base font-medium">
                                  {project.name}
                                </span>
                                <ProjectVisibilityBadge visibility={project.visibility} />
                              </span>
                              <span className="line-clamp-3 text-sm text-muted-foreground">
                                {project.description}
                              </span>
                            </span>
                          </span>
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {t('memberCount', { count: project.member_count })}
                            </span>
                            <Badge variant="outline">
                              {t(`relationship.${getRelationshipKey(project)}`)}
                            </Badge>
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
