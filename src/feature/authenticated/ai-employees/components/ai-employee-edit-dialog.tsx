'use no memo'

import * as React from 'react'

import { useForm, useWatch } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { AiEmployee, AiEmployeeMutation } from '@/schema/ai-employee/ai-employee'
import { aiEmployeeMutationSchema } from '@/schema/ai-employee/ai-employee'
import type { Workflow } from '@/schema/workflow/workflow'
import {
  createAiEmployee,
  getAiEmployeeWorkflows,
  updateAiEmployee,
  updateAiEmployeeWorkflows,
} from '@/service/ai-employees/ai-employees'
import { getWorkflows } from '@/service/workflows/workflows'
import { Bot, Plus, RotateCcw, Save, Search, Trash2, WorkflowIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getErrorMessage } from '@/lib/error'

import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

const WorkflowSearchPageSize = 20
const EmptyWorkflows: Workflow[] = []

const DefaultAiEmployeeValues: AiEmployeeMutation = {
  name: '',
  description: '',
  avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ai-employee',
  status: 'active',
  code_provider: 'github',
  default_model: 'gpt-5',
  system_prompt:
    'You are a sandbox coding agent. Inspect repository context, make minimal changes, and explain risk clearly.',
}

interface AiEmployeeEditDialogProps {
  employee: AiEmployee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toMutationValues(employee: AiEmployee | null): AiEmployeeMutation {
  if (!employee) return DefaultAiEmployeeValues

  return {
    name: employee.name,
    description: employee.description,
    avatar: employee.avatar,
    status: employee.status,
    code_provider: employee.code_provider,
    default_model: employee.default_model,
    system_prompt: employee.system_prompt,
  }
}

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'A'
}

function areSameWorkflowIds(left: number[], right: number[]) {
  if (left.length !== right.length) return false

  const leftSet = new Set(left)
  return right.every((value) => leftSet.has(value))
}

function EmployeeWorkflowSettingsSkeleton() {
  return (
    <section className="grid min-h-0 gap-4 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.1fr)]">
      <div className="flex min-h-72 flex-col gap-3 overflow-hidden">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="flex min-h-72 flex-col gap-3 overflow-hidden">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
        <Skeleton className="h-9 w-full" />
        <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-lg border p-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-36 max-w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="h-8 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AiEmployeeEditDialog({ employee, open, onOpenChange }: AiEmployeeEditDialogProps) {
  const { t, i18n } = useTranslation('aiEmployees')
  const queryClient = useQueryClient()
  const isCreate = employee === null
  const form = useForm<AiEmployeeMutation>({
    resolver: zodResolver(aiEmployeeMutationSchema),
    defaultValues: DefaultAiEmployeeValues,
  })
  const employeeName = useWatch({ control: form.control, name: 'name' })

  React.useEffect(() => {
    if (open) {
      form.reset(toMutationValues(employee))
    }
  }, [employee, form, open])

  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length) {
      void form.trigger()
    }
  }, [i18n.language, form])

  const mutation = useMutation({
    mutationFn: (values: AiEmployeeMutation) =>
      employee ? updateAiEmployee(employee.id, values) : createAiEmployee(values),
    onSuccess: () => {
      toast.success(t(isCreate ? 'toast.createSuccess' : 'toast.updateSuccess'))
      void queryClient.invalidateQueries({ queryKey: ['ai-employees'] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('toast.failed')))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t(isCreate ? 'editDialog.createTitle' : 'editDialog.editTitle')}
          </DialogTitle>
          <DialogDescription>{t('editDialog.description')}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="min-h-0 flex-1 overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="basic">{t('editDialog.tabs.basic')}</TabsTrigger>
            <TabsTrigger value="workflows">{t('editDialog.tabs.workflows')}</TabsTrigger>
          </TabsList>

          <TabsContent
            forceMount
            value="basic"
            className="min-h-0 overflow-y-auto pr-1 data-[state=inactive]:hidden"
          >
            <Form {...form}>
              <form
                className="grid gap-4"
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              >
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('editDialog.avatar')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-12">
                            <AvatarImage src={field.value} alt={employeeName} />
                            <AvatarFallback>{getInitial(employeeName)}</AvatarFallback>
                          </Avatar>
                          <Input placeholder={t('editDialog.avatarPlaceholder')} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('editDialog.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('editDialog.namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="default_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('editDialog.defaultModel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('editDialog.defaultModelPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('editDialog.status')}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="active">{t('status.active')}</SelectItem>
                              <SelectItem value="disabled">{t('status.disabled')}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code_provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('editDialog.codeProvider')}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="github">{t('codeProvider.github')}</SelectItem>
                              <SelectItem value="gitlab">{t('codeProvider.gitlab')}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('editDialog.employeeDescription')}</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-20"
                          placeholder={t('editDialog.descriptionPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="system_prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('editDialog.systemPrompt')}</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-28"
                          placeholder={t('editDialog.systemPromptPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? <Spinner /> : <Save />}
                    {mutation.isPending ? t('editDialog.saving') : t('editDialog.save')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent
            forceMount
            value="workflows"
            className="min-h-0 overflow-y-auto pr-1 data-[state=inactive]:hidden"
          >
            {employee ? (
              <EmployeeWorkflowSettings employee={employee} />
            ) : (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                <Bot className="mb-2 size-4" />
                {t('editDialog.workflowAfterCreate')}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function EmployeeWorkflowSettings({ employee }: { employee: AiEmployee }) {
  const { t } = useTranslation('aiEmployees')
  const queryClient = useQueryClient()
  const [searchValue, setSearchValue] = React.useState('')
  const [workflowKeyword, setWorkflowKeyword] = React.useState('')
  const [draftWorkflowIds, setDraftWorkflowIds] = React.useState<number[] | null>(null)
  const debouncedKeywordChange = useDebouncedCallback((value: string) => {
    setWorkflowKeyword(value.trim())
  }, 300)

  const {
    data: workflows = EmptyWorkflows,
    isFetching,
    isPending: isWorkflowLinksPending,
  } = useQuery({
    queryKey: ['ai-employee-workflows', employee.id],
    queryFn: () => getAiEmployeeWorkflows(employee.id),
  })

  const {
    data: workflowOptionsPage,
    isFetching: isFetchingOptions,
    isPending: isWorkflowOptionsPending,
  } = useQuery({
    queryKey: ['workflows', 'ai-employee-options', { keyword: workflowKeyword }],
    queryFn: () =>
      getWorkflows({
        page: 1,
        perPage: WorkflowSearchPageSize,
        keyword: workflowKeyword || undefined,
        type: 'employee',
      }),
    placeholderData: (previousData) => previousData,
  })

  const isInitialLoading = isWorkflowLinksPending || isWorkflowOptionsPending
  const workflowOptions = workflowOptionsPage?.data ?? EmptyWorkflows
  const workflowIds = React.useMemo(() => workflows.map((workflow) => workflow.id), [workflows])
  const selectedWorkflowIds = draftWorkflowIds ?? workflowIds
  const selectedWorkflowIdSet = React.useMemo(
    () => new Set(selectedWorkflowIds),
    [selectedWorkflowIds]
  )
  const workflowById = React.useMemo(() => {
    const byId = new Map<number, Workflow>()

    for (const workflow of workflows) byId.set(workflow.id, workflow)
    for (const workflow of workflowOptions) byId.set(workflow.id, workflow)

    return byId
  }, [workflowOptions, workflows])
  const selectedWorkflows = selectedWorkflowIds
    .map((workflowId) => workflowById.get(workflowId))
    .filter((workflow): workflow is Workflow => Boolean(workflow))
  const hasChanges = !areSameWorkflowIds(selectedWorkflowIds, workflowIds)

  const mutation = useMutation({
    mutationFn: (workflowIds: number[]) =>
      updateAiEmployeeWorkflows(employee.id, { workflow_ids: workflowIds }),
    onSuccess: (updatedWorkflows) => {
      toast.success(t('toast.workflowsSuccess'))
      queryClient.setQueryData(['ai-employee-workflows', employee.id], updatedWorkflows)
      setDraftWorkflowIds(null)
      void queryClient.invalidateQueries({ queryKey: ['ai-employees'] })
      void queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('toast.failed')))
    },
  })

  const isDisabled = isFetching || mutation.isPending

  if (isInitialLoading) return <EmployeeWorkflowSettingsSkeleton />

  return (
    <section className="grid min-h-0 gap-4 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.1fr)]">
      <div className="flex min-h-72 flex-col gap-3 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium">{t('workflows.configuredTitle')}</h3>
            <p className="text-xs text-muted-foreground">
              {t('workflows.configuredCount', { count: selectedWorkflows.length })}
            </p>
          </div>
          {hasChanges ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={mutation.isPending}
                onClick={() => setDraftWorkflowIds(null)}
              >
                <RotateCcw />
                {t('workflows.reset')}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(selectedWorkflowIds)}
              >
                {mutation.isPending ? <Spinner /> : <Save />}
                {mutation.isPending ? t('workflows.saving') : t('workflows.save')}
              </Button>
            </div>
          ) : null}
        </div>

        {isFetching ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : selectedWorkflows.length === 0 ? (
          <Empty className="min-h-48 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WorkflowIcon />
              </EmptyMedia>
              <EmptyTitle>{t('workflows.emptySelectedTitle')}</EmptyTitle>
              <EmptyDescription>{t('workflows.emptySelected')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border">
            {selectedWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="group flex items-start gap-2 border-b p-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{workflow.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {workflow.description}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={t('workflows.removeWorkflow', { name: workflow.name })}
                  disabled={isDisabled}
                  onClick={() => {
                    setDraftWorkflowIds((currentWorkflowIds) =>
                      (currentWorkflowIds ?? workflowIds).filter((id) => id !== workflow.id)
                    )
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-h-72 flex-col gap-3 overflow-hidden">
        <div>
          <h3 className="text-sm font-medium">{t('workflows.searchTitle')}</h3>
          <p className="text-xs text-muted-foreground">{t('workflows.searchDescription')}</p>
        </div>
        <div className="relative p-0.5">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          {isFetchingOptions ? (
            <Spinner className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          ) : null}
          <Input
            value={searchValue}
            className="pr-9 pl-9"
            placeholder={t('workflows.searchPlaceholder')}
            aria-label={t('workflows.searchPlaceholder')}
            disabled={isDisabled}
            onChange={(event) => {
              const value = event.target.value
              setSearchValue(value)
              debouncedKeywordChange(value)
            }}
          />
        </div>

        {isFetchingOptions && workflowOptions.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border">
            <Spinner className="text-muted-foreground" />
          </div>
        ) : workflowOptions.length === 0 ? (
          <div className="min-h-0 flex-1 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {t('workflows.emptyOptions')}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border">
            {workflowOptions.map((workflow) => {
              const isSelected = selectedWorkflowIdSet.has(workflow.id)

              return (
                <div
                  key={workflow.id}
                  className="flex items-start justify-between gap-3 border-b p-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{workflow.name}</div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">
                      {workflow.description}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={isSelected ? 'outline' : 'secondary'}
                    size="sm"
                    disabled={isSelected || isDisabled}
                    onClick={() => {
                      setDraftWorkflowIds((currentWorkflowIds) => {
                        const nextWorkflowIds = currentWorkflowIds ?? workflowIds
                        if (nextWorkflowIds.includes(workflow.id)) return nextWorkflowIds

                        return [...nextWorkflowIds, workflow.id]
                      })
                    }}
                  >
                    {isSelected ? null : <Plus />}
                    {isSelected ? t('workflows.added') : t('workflows.add')}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
