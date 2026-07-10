'use no memo'

import * as React from 'react'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { Column, ColumnDef } from '@tanstack/react-table'

import type { Task, TaskLevel, TaskType, TaskUser } from '@/schema/task/task'
import { getTasks } from '@/service/tasks/tasks'
import { Bug, ListTodo, Sparkles, Text, Zap } from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { getSortingStateParser } from '@/lib/parsers'

import { useDataTable } from '@/hooks/use-data-table'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
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
  const { t } = useTranslation('tasks')

  const levelOptions = React.useMemo(
    () => [
      { label: t('level.low'), value: 'low' },
      { label: t('level.medium'), value: 'medium' },
      { label: t('level.high'), value: 'high' },
      { label: t('level.critical'), value: 'critical' },
    ],
    [t]
  )

  const typeOptions = React.useMemo(
    () => [
      { label: t('type.bug'), value: 'bug', icon: Bug },
      { label: t('type.feature'), value: 'feature', icon: Sparkles },
      { label: t('type.improvement'), value: 'improvement', icon: Zap },
      { label: t('type.task'), value: 'task', icon: ListTodo },
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

  const { data, isLoading, isFetching, refetch } = useQuery({
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
        id: 'id',
        accessorKey: 'id',
        header: t('columns.id'),
        cell: ({ cell }) => (
          <span className="font-mono text-xs text-muted-foreground">{cell.getValue<number>()}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: t('columns.title'),
        cell: ({ row }) => (
          <HoverCard openDelay={500} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Link
                to={`/task/${row.original.id}`}
                className="font-medium text-primary hover:underline"
              >
                {row.original.title}
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="flex w-64 flex-col gap-0.5">
              <PersonCell user={row.original.assignee} />
              <div className="line-clamp-2 text-xs">{row.original.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(row.original.created_at).toLocaleDateString()}
              </div>
            </HoverCardContent>
          </HoverCard>
        ),
        meta: {
          label: t('columns.title'),
          placeholder: t('search'),
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
          <DataTableColumnHeader column={column} label={t('columns.level')} />
        ),
        cell: ({ cell }) => {
          const level = cell.getValue<TaskLevel>()
          const badgeClass = levelStyles.get(level) ?? ''
          return (
            <Badge variant="outline" className={`capitalize ${badgeClass}`}>
              {t(`level.${level}`)}
            </Badge>
          )
        },
        meta: {
          label: t('columns.level'),
          variant: 'multiSelect',
          options: levelOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: ({ column }: { column: Column<Task, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.type')} />
        ),
        cell: ({ cell }) => {
          const type = cell.getValue<TaskType>()
          const Icon = typeIcons[type]
          return (
            <div className="flex items-center gap-1.5 capitalize">
              {Icon && <Icon className="size-4 text-muted-foreground" />}
              {t(`type.${type}`)}
            </div>
          )
        },
        meta: {
          label: t('columns.type'),
          variant: 'multiSelect',
          options: typeOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'creator',
        accessorFn: (row) => row.creator.name,
        header: t('columns.creator'),
        cell: ({ row }) => <PersonCell user={row.original.creator} />,
        meta: {
          label: t('columns.creator'),
        },
        enableSorting: false,
      },
      {
        id: 'assignee',
        accessorFn: (row) => row.assignee.name,
        header: t('columns.assignee'),
        cell: ({ row }) => <PersonCell user={row.original.assignee} />,
        meta: {
          label: t('columns.assignee'),
        },
        enableSorting: false,
      },
      {
        id: 'resolver',
        accessorFn: (row) => row.resolver?.name ?? '',
        header: t('columns.resolver'),
        cell: ({ row }) => <PersonCell user={row.original.resolver} />,
        meta: {
          label: t('columns.resolver'),
        },
        enableSorting: false,
      },
      {
        id: 'updated_at',
        accessorKey: 'updated_at',
        header: t('columns.updatedAt'),
        meta: {
          label: t('columns.updatedAt'),
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
      <ToggleGroupItem value="simple">{t('tabs.simple')}</ToggleGroupItem>
      <ToggleGroupItem value="advanced">{t('tabs.advanced')}</ToggleGroupItem>
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
          <DataTableToolbar table={table} onSearch={() => refetch()}>
            {filterToggle}
          </DataTableToolbar>
        )}
      </DataTable>
    </div>
  )
}

function PersonCell({ user }: { user: TaskUser | null }) {
  if (!user) return <span className="text-muted-foreground">-</span>

  return (
    <div className="flex min-w-0 items-center gap-2" title={user.email}>
      <Avatar size="sm">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{getNameInitial(user.name)}</AvatarFallback>
      </Avatar>
      <span className="max-w-28 truncate">{user.name}</span>
    </div>
  )
}

function getNameInitial(name: string) {
  return name.trim().charAt(0).toUpperCase()
}
