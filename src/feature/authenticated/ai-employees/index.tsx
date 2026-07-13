'use no memo'

import * as React from 'react'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Column, ColumnDef } from '@tanstack/react-table'

import type { AiEmployee } from '@/schema/ai-employee/ai-employee'
import {
  deleteAiEmployees,
  getAiEmployees,
  updateAiEmployee,
} from '@/service/ai-employees/ai-employees'
import { CheckCircle, Code2, GitBranch, MoreHorizontal, Plus, Text, XCircle } from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getErrorMessage } from '@/lib/error'
import { getSortingStateParser } from '@/lib/parsers'

import { useDataTable } from '@/hooks/use-data-table'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { ConfigDrawer } from '@/components/config-drawer'
import ConfirmDialog from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { AiEmployeeEditDialog } from './components/ai-employee-edit-dialog'

const EmptyList: AiEmployee[] = []

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'A'
}

const AiEmployees = () => {
  const { t } = useTranslation('aiEmployees')
  const queryClient = useQueryClient()
  const [editEmployee, setEditEmployee] = React.useState<AiEmployee | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [deleteEmployee, setDeleteEmployee] = React.useState<AiEmployee | null>(null)

  const columnIds = React.useMemo(() => new Set(['updated_at', 'created_at']), [])
  const [page] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [sorting] = useQueryState(
    'sort',
    getSortingStateParser<AiEmployee>(columnIds).withDefault([{ id: 'updated_at', desc: true }])
  )
  const [keyword] = useQueryState('name', parseAsString.withDefault(''))
  const [status] = useQueryState('status', parseAsArrayOf(parseAsString, ',').withDefault([]))
  const [codeProvider] = useQueryState(
    'code_provider',
    parseAsArrayOf(parseAsString, ',').withDefault([])
  )

  const statusOptions = React.useMemo(
    () => [
      { label: t('status.active'), value: 'active', icon: CheckCircle },
      { label: t('status.disabled'), value: 'disabled', icon: XCircle },
    ],
    [t]
  )
  const providerOptions = React.useMemo(
    () => [
      { label: t('codeProvider.github'), value: 'github', icon: Code2 },
      { label: t('codeProvider.gitlab'), value: 'gitlab', icon: GitBranch },
    ],
    [t]
  )

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['ai-employees', { page, perPage, sorting, keyword, status, codeProvider }],
    queryFn: () =>
      getAiEmployees({
        page,
        perPage,
        sort: sorting,
        keyword: keyword || undefined,
        status: status.length > 0 ? (status as Array<'active' | 'disabled'>) : undefined,
        codeProvider: codeProvider.length > 0 ? codeProvider : undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAiEmployees,
    onSuccess: () => {
      toast.success(t('toast.deleteSuccess'))
      setDeleteEmployee(null)
      void queryClient.invalidateQueries({ queryKey: ['ai-employees'] })
      void queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('toast.failed')))
    },
  })

  const statusMutation = useMutation({
    mutationFn: (employee: AiEmployee) =>
      updateAiEmployee(employee.id, {
        name: employee.name,
        description: employee.description,
        avatar: employee.avatar,
        status: employee.status === 'active' ? 'disabled' : 'active',
        code_provider: employee.code_provider,
        default_model: employee.default_model,
        system_prompt: employee.system_prompt,
      }),
    onSuccess: () => {
      toast.success(t('toast.updateSuccess'))
      void queryClient.invalidateQueries({ queryKey: ['ai-employees'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('toast.failed')))
    },
  })

  const columns = React.useMemo<ColumnDef<AiEmployee>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }: { column: Column<AiEmployee, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.name')} />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={row.original.avatar} alt={row.original.name} />
              <AvatarFallback>{getInitial(row.original.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">{row.original.name}</div>
              <div className="max-w-80 truncate text-xs text-muted-foreground">
                {row.original.description}
              </div>
            </div>
          </div>
        ),
        meta: {
          label: t('columns.name'),
          placeholder: t('search'),
          variant: 'text',
          icon: Text,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }: { column: Column<AiEmployee, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.status')} />
        ),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.status === 'active'
                ? 'border-teal-200 bg-teal-100/30 text-teal-900 dark:text-teal-200'
                : 'border-neutral-300 bg-neutral-300/40'
            }
          >
            {t(`status.${row.original.status}`)}
          </Badge>
        ),
        meta: {
          label: t('columns.status'),
          variant: 'multiSelect',
          options: statusOptions,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'code_provider',
        accessorKey: 'code_provider',
        header: ({ column }: { column: Column<AiEmployee, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.codeProvider')} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            {row.original.code_provider === 'github' ? (
              <Code2 className="size-4 text-muted-foreground" />
            ) : (
              <GitBranch className="size-4 text-muted-foreground" />
            )}
            {t(`codeProvider.${row.original.code_provider}`)}
          </div>
        ),
        meta: {
          label: t('columns.codeProvider'),
          variant: 'multiSelect',
          options: providerOptions,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'default_model',
        accessorKey: 'default_model',
        header: t('columns.defaultModel'),
        cell: ({ row }) => <Badge variant="secondary">{row.original.default_model}</Badge>,
        enableSorting: false,
      },
      {
        id: 'workflow_count',
        accessorKey: 'workflow_count',
        header: t('columns.workflowCount'),
        enableSorting: false,
      },
      {
        id: 'updated_at',
        accessorKey: 'updated_at',
        header: ({ column }: { column: Column<AiEmployee, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.updatedAt')} />
        ),
        cell: ({ cell }) => new Date(cell.getValue<Date>()).toLocaleDateString(),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">{t('openMenu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditEmployee(row.original)}>
                {t('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => statusMutation.mutate(row.original)}>
                {row.original.status === 'active' ? t('disable') : t('enable')}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteEmployee(row.original)}
              >
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 32,
      },
    ],
    [providerOptions, statusMutation, statusOptions, t]
  )

  const { table } = useDataTable({
    data: data?.data ?? EmptyList,
    columns,
    rowCount: data?.total ?? 0,
    initialState: {
      sorting: [{ id: 'updated_at', desc: true }],
      columnPinning: { right: ['actions'] },
    },
    getRowId: (row) => String(row.id),
  })

  if (isLoading) {
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
        <AppMain fixed className="gap-4 sm:gap-6">
          <DataTableSkeleton columnCount={8} filterCount={3} />
        </AppMain>
      </>
    )
  }

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
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            {t('create')}
          </Button>
        </div>

        <div className="data-table-container">
          <DataTable table={table} isFetching={isFetching && !isLoading}>
            <DataTableToolbar table={table} onSearch={() => refetch()} />
          </DataTable>
        </div>
      </AppMain>

      <AiEmployeeEditDialog employee={null} open={createOpen} onOpenChange={setCreateOpen} />
      <AiEmployeeEditDialog
        employee={editEmployee}
        open={editEmployee !== null}
        onOpenChange={(open) => {
          if (!open) setEditEmployee(null)
        }}
      />
      <ConfirmDialog
        open={deleteEmployee !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteEmployee(null)
        }}
        title={t('deleteConfirm.title')}
        desc={t('deleteConfirm.single', { name: deleteEmployee?.name ?? '' })}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (deleteEmployee) deleteMutation.mutate([deleteEmployee.id])
        }}
      />
    </>
  )
}

export default AiEmployees
