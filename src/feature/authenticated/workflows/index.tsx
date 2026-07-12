import * as React from 'react'

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { getWorkflows } from '@/service/workflows/workflows'
import { parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Spinner } from '@/components/ui/spinner'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { EmptyWorkflows } from './components/constants'
import { EmptyWorkflowsState } from './components/empty-workflows-state'
import { WorkflowsList } from './components/workflows-list'

const WorkflowsPageSize = 20

const Workflows = () => {
  const { t } = useTranslation('workflows')
  const navigate = useNavigate()
  const [workflowKeyword, setWorkflowKeyword] = useQueryState(
    'workflowKeyword',
    parseAsString.withDefault('')
  )

  const {
    data: workflowsPages,
    fetchNextPage: fetchNextWorkflowsPage,
    hasNextPage: hasNextWorkflowsPage = false,
    isFetchingNextPage: isFetchingNextWorkflowsPage,
    isLoading: isWorkflowsLoading,
  } = useInfiniteQuery({
    queryKey: ['workflows', { keyword: workflowKeyword }],
    queryFn: ({ pageParam }) =>
      getWorkflows({
        page: pageParam,
        perPage: WorkflowsPageSize,
        keyword: workflowKeyword || undefined,
      }),
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.data.length, 0)
      const total = allPages[0]?.total ?? 0
      return loaded < total ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  })

  const workflows = React.useMemo(
    () => workflowsPages?.pages.flatMap((page) => page.data) ?? EmptyWorkflows,
    [workflowsPages?.pages]
  )
  const workflowsTotal = workflowsPages?.pages[0]?.total ?? 0
  const hasWorkflowKeyword = workflowKeyword.trim().length > 0

  const handleWorkflowKeywordChange = React.useCallback(
    (keyword: string) => {
      void setWorkflowKeyword(keyword || null)
    },
    [setWorkflowKeyword]
  )

  const handleLoadMoreWorkflows = React.useCallback(() => {
    void fetchNextWorkflowsPage()
  }, [fetchNextWorkflowsPage])

  const handleSelectWorkflow = React.useCallback(
    (workflowId: number) => {
      void navigate(`/workflow/${workflowId}`)
    },
    [navigate]
  )

  return (
    <>
      <AppHeader fixed>
        <Search />
        <div className="ms-auto flex items-center gap-4">
          <ThemeModeSwitcher />
          <LanguageSwitcher />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </AppHeader>
      <AppMain fixed className="min-h-0 flex-1 basis-0 gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        {isWorkflowsLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Spinner />
          </div>
        ) : workflows.length === 0 && !hasWorkflowKeyword ? (
          <EmptyWorkflowsState />
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            <WorkflowsList
              workflows={workflows}
              workflowsTotal={workflowsTotal}
              keyword={workflowKeyword}
              isLoading={isWorkflowsLoading}
              isFetchingNextPage={isFetchingNextWorkflowsPage}
              hasNextPage={hasNextWorkflowsPage}
              onKeywordChange={handleWorkflowKeywordChange}
              onLoadMore={handleLoadMoreWorkflows}
              onSelectWorkflow={handleSelectWorkflow}
            />
          </div>
        )}
      </AppMain>
    </>
  )
}

export default Workflows
