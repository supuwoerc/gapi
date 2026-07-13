import * as React from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ProjectWorkflowAiNodeConfig } from '@/schema/project/project'
import type { Workflow } from '@/schema/workflow/workflow'
import { getAiEmployeeWorkflows, getAiEmployees } from '@/service/ai-employees/ai-employees'
import {
  getProjectWorkflowAiNodeConfigs,
  updateProjectWorkflowAiNodeConfig,
} from '@/service/projects/projects'
import { getWorkflows } from '@/service/workflows/workflows'
import {
  KeyRound,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Trash2,
  WorkflowIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getErrorMessage } from '@/lib/error'

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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

const WorkflowSearchPageSize = 20
const EmptyWorkflowOptions: Workflow[] = []

interface ProjectWorkflowSettingsProps {
  projectId?: number
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
  projectId,
  workflows,
  isFetching,
  isSaving,
  onSave,
}: ProjectWorkflowSettingsProps) {
  const { t } = useTranslation('projects')
  const [configWorkflow, setConfigWorkflow] = React.useState<Workflow | null>(null)
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
        type: 'project',
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
                  className="group flex items-start gap-2 border-b p-3 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-medium">{workflow.name}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {workflow.description}
                    </span>
                  </div>
                  {projectId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('settings.workflows.configureAiNodes', {
                        name: workflow.name,
                      })}
                      disabled={isDisabled}
                      onClick={() => setConfigWorkflow(workflow)}
                    >
                      <Settings2 />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label={t('settings.workflows.removeWorkflow', {
                      name: workflow.name,
                    })}
                    disabled={isDisabled}
                    onClick={() => handleRemoveWorkflow(workflow.id)}
                  >
                    <Trash2 />
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
      {projectId ? (
        <ProjectWorkflowAiConfigSheet
          projectId={projectId}
          workflow={configWorkflow}
          open={configWorkflow !== null}
          onOpenChange={(open) => {
            if (!open) setConfigWorkflow(null)
          }}
        />
      ) : null}
    </Card>
  )
}

function ProjectWorkflowAiConfigSheet({
  projectId,
  workflow,
  open,
  onOpenChange,
}: {
  projectId: number
  workflow: Workflow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('projects')
  const workflowId = workflow?.id ?? null

  const { data: configs = [], isFetching } = useQuery({
    queryKey: ['project-workflow-ai-node-configs', projectId, workflowId],
    queryFn: () => getProjectWorkflowAiNodeConfigs(projectId, workflowId!),
    enabled: open && workflowId !== null,
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-[min(36rem,calc(100vw-2rem))] flex-col overflow-hidden sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('settings.workflows.aiConfigTitle')}</SheetTitle>
          <SheetDescription>
            {t('settings.workflows.aiConfigDescription', { name: workflow?.name ?? '' })}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {isFetching ? (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-36 rounded-lg" />
              ))}
            </div>
          ) : configs.length === 0 ? (
            <Empty className="min-h-72 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <KeyRound />
                </EmptyMedia>
                <EmptyTitle>{t('settings.workflows.emptyAiConfigTitle')}</EmptyTitle>
                <EmptyDescription>{t('settings.workflows.emptyAiConfig')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : workflowId !== null ? (
            <div className="grid gap-3">
              {configs.map((config) => (
                <ProjectWorkflowAiNodeConfigForm
                  key={`${config.node_id}-${config.updated_at.toISOString()}`}
                  projectId={projectId}
                  workflowId={workflowId}
                  config={config}
                />
              ))}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ProjectWorkflowAiNodeConfigForm({
  projectId,
  workflowId,
  config,
}: {
  projectId: number
  workflowId: number
  config: ProjectWorkflowAiNodeConfig
}) {
  const { t } = useTranslation('projects')
  const queryClient = useQueryClient()
  const [aiEmployeeId, setAiEmployeeId] = React.useState<number | null>(config.ai_employee_id)
  const [employeeWorkflowId, setEmployeeWorkflowId] = React.useState<number | null>(
    config.employee_workflow_id
  )
  const [codeProvider, setCodeProvider] = React.useState(config.code_provider)
  const [repositoryUrl, setRepositoryUrl] = React.useState(config.repository_url)
  const [defaultBranch, setDefaultBranch] = React.useState(config.default_branch)
  const [token, setToken] = React.useState('')

  const { data: aiEmployeesPage, isFetching: isAiEmployeesFetching } = useQuery({
    queryKey: ['ai-employees', 'project-node-options'],
    queryFn: () => getAiEmployees({ page: 1, perPage: 20, status: ['active'] }),
  })

  const { data: employeeWorkflows = [], isFetching: isEmployeeWorkflowsFetching } = useQuery({
    queryKey: ['ai-employee-workflows', aiEmployeeId],
    queryFn: () => getAiEmployeeWorkflows(aiEmployeeId!),
    enabled: aiEmployeeId !== null,
  })

  const mutation = useMutation({
    mutationFn: () =>
      updateProjectWorkflowAiNodeConfig(projectId, workflowId, config.node_id, {
        ai_employee_id: aiEmployeeId,
        employee_workflow_id: employeeWorkflowId,
        code_provider: codeProvider,
        repository_url: repositoryUrl,
        default_branch: defaultBranch,
        token: token.trim() ? token.trim() : undefined,
      }),
    onSuccess: (configs) => {
      toast.success(t('toast.aiNodeConfigSuccess'))
      setToken('')
      queryClient.setQueryData(['project-workflow-ai-node-configs', projectId, workflowId], configs)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('toast.failed')))
    },
  })

  const aiEmployees = aiEmployeesPage?.data ?? []

  return (
    <div className="grid gap-3 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">
            {t('settings.workflows.aiConfigNode', { node: config.node_id })}
          </div>
          <div className="text-xs text-muted-foreground">
            {config.has_token
              ? t('settings.workflows.tokenConfigured', { token: config.token_mask ?? '' })
              : t('settings.workflows.tokenMissing')}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>{t('settings.workflows.aiEmployee')}</Label>
          <Select
            value={aiEmployeeId === null ? 'none' : String(aiEmployeeId)}
            disabled={isAiEmployeesFetching || mutation.isPending}
            onValueChange={(value) => {
              setAiEmployeeId(value === 'none' ? null : Number(value))
              setEmployeeWorkflowId(null)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="none">{t('settings.workflows.none')}</SelectItem>
                {aiEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>{t('settings.workflows.employeeWorkflow')}</Label>
          <Select
            value={employeeWorkflowId === null ? 'none' : String(employeeWorkflowId)}
            disabled={aiEmployeeId === null || isEmployeeWorkflowsFetching || mutation.isPending}
            onValueChange={(value) => {
              setEmployeeWorkflowId(value === 'none' ? null : Number(value))
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="none">{t('settings.workflows.none')}</SelectItem>
                {employeeWorkflows.map((workflow) => (
                  <SelectItem key={workflow.id} value={String(workflow.id)}>
                    {workflow.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>{t('settings.workflows.codeProvider')}</Label>
          <Select
            value={codeProvider}
            disabled={mutation.isPending}
            onValueChange={(value) => setCodeProvider(value as 'github' | 'gitlab')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="gitlab">GitLab</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`project-workflow-branch-${config.node_id}`}>
            {t('settings.workflows.defaultBranch')}
          </Label>
          <Input
            id={`project-workflow-branch-${config.node_id}`}
            value={defaultBranch}
            disabled={mutation.isPending}
            onChange={(event) => setDefaultBranch(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`project-workflow-repository-${config.node_id}`}>
          {t('settings.workflows.repositoryUrl')}
        </Label>
        <Input
          id={`project-workflow-repository-${config.node_id}`}
          value={repositoryUrl}
          disabled={mutation.isPending}
          placeholder={t('settings.workflows.repositoryPlaceholder')}
          onChange={(event) => setRepositoryUrl(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`project-workflow-token-${config.node_id}`}>
          {t('settings.workflows.token')}
        </Label>
        <Input
          id={`project-workflow-token-${config.node_id}`}
          type="password"
          value={token}
          disabled={mutation.isPending}
          placeholder={
            config.has_token
              ? t('settings.workflows.keepTokenPlaceholder')
              : t('settings.workflows.tokenPlaceholder')
          }
          onChange={(event) => setToken(event.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? <Spinner /> : <Save />}
          {mutation.isPending ? t('settings.workflows.saving') : t('settings.workflows.saveConfig')}
        </Button>
      </div>
    </div>
  )
}
