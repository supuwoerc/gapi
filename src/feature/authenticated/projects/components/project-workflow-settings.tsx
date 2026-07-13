import * as React from 'react'

import { useQuery } from '@tanstack/react-query'

import type { Workflow } from '@/schema/workflow/workflow'
import { getWorkflows } from '@/service/workflows/workflows'
import { Plus, RotateCcw, Save, Search, WorkflowIcon, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

const WorkflowSearchPageSize = 20
const EmptyWorkflowOptions: Workflow[] = []

interface ProjectWorkflowSettingsProps {
  workflows: Workflow[]
  isFetching: boolean
  isSaving: boolean
  onSave: (workflowIds: number[]) => void
}

function areSameWorkflowIds(left: number[], right: number[]) {
  if (left.length !== right.length) return false

  const leftSet = new Set(left)
  return right.every((value) => leftSet.has(value))
}

export function ProjectWorkflowSettings({
  workflows,
  isFetching,
  isSaving,
  onSave,
}: ProjectWorkflowSettingsProps) {
  const { t } = useTranslation('projects')
  const [searchValue, setSearchValue] = React.useState('')
  const [workflowKeyword, setWorkflowKeyword] = React.useState('')
  const [draftWorkflowIds, setDraftWorkflowIds] = React.useState<number[] | null>(null)
  const debouncedKeywordChange = useDebouncedCallback((value: string) => {
    setWorkflowKeyword(value.trim())
  }, 300)

  const workflowIds = React.useMemo(() => workflows.map((workflow) => workflow.id), [workflows])
  const selectedWorkflowIds = draftWorkflowIds ?? workflowIds
  const selectedWorkflowIdSet = React.useMemo(
    () => new Set(selectedWorkflowIds),
    [selectedWorkflowIds]
  )

  const { data: workflowOptionsPage, isFetching: isFetchingOptions } = useQuery({
    queryKey: ['workflows', 'project-options', { keyword: workflowKeyword }],
    queryFn: () =>
      getWorkflows({
        page: 1,
        perPage: WorkflowSearchPageSize,
        keyword: workflowKeyword || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const workflowOptions = workflowOptionsPage?.data ?? EmptyWorkflowOptions

  const workflowById = React.useMemo(() => {
    const byId = new Map<number, Workflow>()

    for (const workflow of workflows) {
      byId.set(workflow.id, workflow)
    }

    for (const workflow of workflowOptions) {
      byId.set(workflow.id, workflow)
    }

    return byId
  }, [workflowOptions, workflows])

  const selectedWorkflows = React.useMemo(
    () =>
      selectedWorkflowIds
        .map((workflowId) => workflowById.get(workflowId))
        .filter((workflow): workflow is Workflow => Boolean(workflow)),
    [selectedWorkflowIds, workflowById]
  )

  const hasChanges = !areSameWorkflowIds(selectedWorkflowIds, workflowIds)
  const isDisabled = isFetching || isSaving

  const handleAddWorkflow = React.useCallback(
    (workflowId: number) => {
      setDraftWorkflowIds((currentWorkflowIds) => {
        const nextWorkflowIds = currentWorkflowIds ?? workflowIds
        if (nextWorkflowIds.includes(workflowId)) return nextWorkflowIds

        return [...nextWorkflowIds, workflowId]
      })
    },
    [workflowIds]
  )

  const handleRemoveWorkflow = React.useCallback(
    (workflowId: number) => {
      setDraftWorkflowIds((currentWorkflowIds) =>
        (currentWorkflowIds ?? workflowIds).filter((id) => id !== workflowId)
      )
    },
    [workflowIds]
  )

  return (
    <Card className="h-full min-h-0 w-full min-w-0">
      <CardHeader>
        <CardTitle>{t('settings.workflows.title')}</CardTitle>
        <CardDescription>{t('settings.workflows.description')}</CardDescription>
        {hasChanges ? (
          <CardAction className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => setDraftWorkflowIds(null)}
            >
              <RotateCcw data-icon="inline-start" />
              {t('settings.workflows.reset')}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={() => onSave(selectedWorkflowIds)}
            >
              {isSaving ? <Spinner /> : <Save data-icon="inline-start" />}
              {isSaving ? t('settings.workflows.saving') : t('settings.workflows.save')}
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="grid min-h-0 flex-1 grid-rows-[minmax(12rem,0.85fr)_minmax(16rem,1.15fr)] gap-4 overflow-hidden lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)] lg:grid-rows-1">
        <section className="flex min-h-0 flex-col gap-3 overflow-hidden">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('settings.workflows.configuredTitle')}</span>
            <span className="text-xs text-muted-foreground">
              {t('settings.workflows.configuredCount', { count: selectedWorkflows.length })}
            </span>
          </div>

          {isFetching ? (
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : selectedWorkflows.length === 0 ? (
            <Empty className="min-h-0 flex-1 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WorkflowIcon />
                </EmptyMedia>
                <EmptyTitle>{t('settings.workflows.emptySelectedTitle')}</EmptyTitle>
                <EmptyDescription>{t('settings.workflows.emptySelected')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-lg border">
              {selectedWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="flex items-start gap-2 border-b p-3 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-medium">{workflow.name}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {workflow.description}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('settings.workflows.removeWorkflow', {
                      name: workflow.name,
                    })}
                    disabled={isDisabled}
                    onClick={() => handleRemoveWorkflow(workflow.id)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex min-h-0 flex-col gap-3 overflow-hidden">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('settings.workflows.searchTitle')}</span>
            <span className="text-xs text-muted-foreground">
              {t('settings.workflows.searchDescription')}
            </span>
          </div>
          <div className="relative p-0.5">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              className="pl-9"
              placeholder={t('settings.workflows.searchPlaceholder')}
              aria-label={t('settings.workflows.searchPlaceholder')}
              disabled={isDisabled}
              onChange={(event) => {
                const value = event.target.value
                setSearchValue(value)
                debouncedKeywordChange(value)
              }}
            />
          </div>

          {isFetchingOptions ? (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border">
              <Spinner className="text-muted-foreground" />
            </div>
          ) : workflowOptions.length === 0 ? (
            <div className="min-h-0 flex-1 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              {t('settings.workflows.emptyOptions')}
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-lg border">
              {workflowOptions.map((workflow) => {
                const isSelected = selectedWorkflowIdSet.has(workflow.id)

                return (
                  <div
                    key={workflow.id}
                    className="flex items-start justify-between gap-3 border-b p-3 last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate font-medium">{workflow.name}</span>
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {workflow.description}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant={isSelected ? 'outline' : 'secondary'}
                      size="sm"
                      disabled={isSelected || isDisabled}
                      onClick={() => handleAddWorkflow(workflow.id)}
                    >
                      {isSelected ? null : <Plus data-icon="inline-start" />}
                      {isSelected ? t('settings.workflows.added') : t('settings.workflows.add')}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  )
}
