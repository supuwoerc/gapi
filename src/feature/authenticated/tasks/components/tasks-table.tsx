'use no memo'

import * as React from 'react'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { Column, ColumnDef } from '@tanstack/react-table'

import type { Task, TaskLevel, TaskType } from '@/schema/tasks/tasks'
import { getTasks } from '@/service/tasks/tasks'
import { Bug, ListTodo, Sparkles, Text, Zap } from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { getSortingStateParser } from '@/lib/parsers'

import { useDataTable } from '@/hooks/use-data-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

const levelStyles = new Map<TaskLevel, string>([
  ['low', 'bg-neutral-300/40 border-neutral-300'],
  ['medium', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['high', 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300'],
  [
    'critical',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

const typeIcons: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  bug: Bug,
  feature: Sparkles,
  improvement: Zap,
  task: ListTodo,
}

const EmptyList: Array<Task> = []

export function TasksTable() {
  const { t } = useTranslation('feature')

  const levelOptions = React.useMemo(
    () => [
      { label: t('tasks.level.low'), value: 'low' },
      { label: t('tasks.level.medium'), value: 'medium' },
      { label: t('tasks.level.high'), value: 'high' },
      { label: t('tasks.level.critical'), value: 'critical' },
    ],
    [t]
  )

  const typeOptions = React.useMemo(
    () => [
      { label: t('tasks.type.bug'), value: 'bug', icon: Bug },
      { label: t('tasks.type.feature'), value: 'feature', icon: Sparkles },
      { label: t('tasks.type.improvement'), value: 'improvement', icon: Zap },
      { label: t('tasks.type.task'), value: 'task', icon: ListTodo },
    ],
    [t]
  )

  const [enableAdvancedFilter, setEnableAdvancedFilter] = React.useState(false)

  const columnIds = React.useMemo(() => new Set(['level', 'type', 'updated_at']), [])

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [sorting] = useQueryState(
    'sort',
    getSortingStateParser<Task>(columnIds).withDefault([{ id: 'updated_at', desc: true }])
  )
  const [title, setTitle] = useQueryState('title', parseAsString.withDefault(''))
  const [level, setLevel] = useQueryState(
    'level',
    parseAsArrayOf(parseAsString, ',').withDefault([])
  )
  const [type, setType] = useQueryState('type', parseAsArrayOf(parseAsString, ',').withDefault([]))
  const [filters, setFilters] = useQueryState('filters', parseAsString.withDefault(''))

  const onTabChange = React.useCallback(
    (value: string) => {
      const isAdvanced = value === 'advanced'
      setEnableAdvancedFilter(isAdvanced)
      void setPage(1)
      if (isAdvanced) {
        void setTitle(null)
        void setLevel(null)
        void setType(null)
      } else {
        void setFilters(null)
      }
    },
    [setPage, setTitle, setLevel, setType, setFilters]
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['tasks', { page, perPage, sorting, title, level, type, filters }],
    queryFn: () =>
      getTasks({
        page,
        perPage,
        sort: sorting,
        title: title || undefined,
        level: level.length > 0 ? level : undefined,
        type: type.length > 0 ? type : undefined,
        filters: filters || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = React.useMemo<ColumnDef<Task>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'id',
        accessorKey: 'id',
        header: t('tasks.columns.id'),
        cell: ({ cell }) => (
          <span className="font-mono text-xs text-muted-foreground">{cell.getValue<number>()}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: t('tasks.columns.title'),
        cell: ({ row }) => (
          <Link
            to={`/tasks/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.title}
          </Link>
        ),
        meta: {
          label: t('tasks.columns.title'),
          placeholder: t('tasks.search'),
          variant: 'text',
          icon: Text,
        },
        enableSorting: false,
        enableColumnFilter: true,
      },
      {
        id: 'level',
        accessorKey: 'level',
        header: ({ column }: { column: Column<Task, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('tasks.columns.level')} />
        ),
        cell: ({ cell }) => {
          const level = cell.getValue<TaskLevel>()
          const badgeClass = levelStyles.get(level) ?? ''
          return (
            <Badge variant="outline" className={`capitalize ${badgeClass}`}>
              {t(`tasks.level.${level}`)}
            </Badge>
          )
        },
        meta: {
          label: t('tasks.columns.level'),
          variant: 'multiSelect',
          options: levelOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: ({ column }: { column: Column<Task, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('tasks.columns.type')} />
        ),
        cell: ({ cell }) => {
          const type = cell.getValue<TaskType>()
          const Icon = typeIcons[type]
          return (
            <div className="flex items-center gap-1.5 capitalize">
              {Icon && <Icon className="size-4 text-muted-foreground" />}
              {t(`tasks.type.${type}`)}
            </div>
          )
        },
        meta: {
          label: t('tasks.columns.type'),
          variant: 'multiSelect',
          options: typeOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'creator',
        accessorKey: 'creator',
        header: t('tasks.columns.creator'),
        meta: {
          label: t('tasks.columns.creator'),
        },
        enableSorting: false,
      },
      {
        id: 'assignee',
        accessorKey: 'assignee',
        header: t('tasks.columns.assignee'),
        meta: {
          label: t('tasks.columns.assignee'),
        },
        enableSorting: false,
      },
      {
        id: 'resolver',
        accessorKey: 'resolver',
        header: t('tasks.columns.resolver'),
        cell: ({ cell }) => {
          const value = cell.getValue<string>()
          return value || <span className="text-muted-foreground">-</span>
        },
        meta: {
          label: t('tasks.columns.resolver'),
        },
        enableSorting: false,
      },
      {
        id: 'updated_at',
        accessorKey: 'updated_at',
        header: t('tasks.columns.updatedAt'),
        meta: {
          label: t('tasks.columns.updatedAt'),
        },
        enableHiding: false,
      },
    ],
    [t, levelOptions, typeOptions]
  )

  const { table } = useDataTable({
    data: data?.data ?? EmptyList,
    columns,
    rowCount: data?.total ?? 0,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: 'updated_at', desc: true }],
      columnVisibility: { updated_at: false },
    },
    getRowId: (row) => String(row.id),
  })

  if (isLoading) {
    return <DataTableSkeleton columnCount={8} filterCount={3} />
  }

  const filterToggle = (
    <ToggleGroup
      type="single"
      value={enableAdvancedFilter ? 'advanced' : 'simple'}
      onValueChange={(value) => {
        if (value) onTabChange(value)
      }}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="simple">{t('tasks.tabs.simple')}</ToggleGroupItem>
      <ToggleGroupItem value="advanced">{t('tasks.tabs.advanced')}</ToggleGroupItem>
    </ToggleGroup>
  )

  return (
    <div className="data-table-container">
      <DataTable table={table} isFetching={isFetching && !isLoading}>
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table} actions={filterToggle}>
            <DataTableFilterList table={table} />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>{filterToggle}</DataTableToolbar>
        )}
      </DataTable>
    </div>
  )
}
